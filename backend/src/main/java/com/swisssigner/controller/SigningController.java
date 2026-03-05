package com.swisssigner.controller;

import com.swisssigner.model.*;
import com.swisssigner.service.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sign")
public class SigningController {

    private static final String SESSION_KEY = "signingData";
    private static final Logger swisscomLog = LoggerFactory.getLogger("com.swisssigner.swisscom");

    private final PricingService pricingService;
    private final FileStorageService fileStorageService;
    private final PaymentService paymentService;
    private final SignInviteService signInviteService;
    private final ContractAnalysisJobService contractAnalysisJobService;
    private final ConfirmationPdfService confirmationPdfService;
    private final AnalysisReportPdfService analysisReportPdfService;
    private final AnalysisConfirmationPdfService analysisConfirmationPdfService;

    public SigningController(PricingService pricingService,
                             FileStorageService fileStorageService,
                             PaymentService paymentService,
                             SignInviteService signInviteService,
                             ContractAnalysisJobService contractAnalysisJobService,
                             ConfirmationPdfService confirmationPdfService,
                             AnalysisReportPdfService analysisReportPdfService,
                             AnalysisConfirmationPdfService analysisConfirmationPdfService) {
        this.pricingService = pricingService;
        this.fileStorageService = fileStorageService;
        this.paymentService = paymentService;
        this.signInviteService = signInviteService;
        this.contractAnalysisJobService = contractAnalysisJobService;
        this.confirmationPdfService = confirmationPdfService;
        this.analysisReportPdfService = analysisReportPdfService;
        this.analysisConfirmationPdfService = analysisConfirmationPdfService;
    }

    /** Upload PDF. Stores file and saves reference in session. */
    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file,
                                     HttpSession session) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
        }
        if (!isPdfFile(file)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only PDF files are allowed"));
        }

        String ref = fileStorageService.store(file);
        SigningSessionData data = getOrCreate(session);
        data.setDocumentName(file.getOriginalFilename());
        data.setDocumentRef(ref);
        data.setSignatories(List.of());
        data.setPlacements(List.of());
        data.setSignatureLevel(Signatory.LEVEL_QES);
        data.setInitiator(null);
        data.setPrice(null);
        data.setContractAnalysisRequested(false);
        resetAnalysisState(data);
        resetProcessState(data);
        data.setStep("SIGNATORIES");
        save(session, data);

        return ResponseEntity.ok(Map.of("documentName", file.getOriginalFilename()));
    }

    /** Set signatories and calculate price. */
    @PostMapping("/signatories")
    public ResponseEntity<?> setSignatories(@RequestBody SetSignatoriesRequest req,
                                             HttpSession session) {
        if (req.getSignatories() == null || req.getSignatories().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "At least one signatory required"));
        }
        String normalizedDocumentLevel = normalizeSignatureLevel(req.getSignatureLevel());
        if (normalizedDocumentLevel == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "signatureLevel must be SIMPLE, AES or QES"));
        }

        for (Signatory s : req.getSignatories()) {
            if (s.getId() == null || s.getId().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "signatory.id is required"));
            }
            if (s.getFirstName() == null || s.getFirstName().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "signatory.firstName is required"));
            }
            if (s.getLastName() == null || s.getLastName().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "signatory.lastName is required"));
            }
            boolean hasEmail = s.getEmail() != null && !s.getEmail().isBlank();
            boolean hasPhone = s.getPhone() != null && !s.getPhone().isBlank();
            if (!hasEmail && !hasPhone) {
                return ResponseEntity.badRequest().body(Map.of("error", "Each signatory needs email or phone"));
            }
            s.setSignatureLevel(normalizedDocumentLevel);
        }

        SigningSessionData data = getOrCreate(session);
        if (data.getDocumentRef() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Upload a document first"));
        }

        PriceBreakdown price = pricingService.calculate(
            req.getSignatories().size(),
            normalizedDocumentLevel,
            data.isContractAnalysisRequested()
        );
        data.setSignatories(req.getSignatories());
        data.setSignatureLevel(normalizedDocumentLevel);
        data.setPlacements(List.of());
        // Initiator is handled by system-side defaults.
        data.setInitiator(null);
        resetProcessState(data);
        data.setPrice(price);
        data.setStep("PLACEMENT");
        save(session, data);

        return ResponseEntity.ok(Map.of("signatories", req.getSignatories(), "price", price));
    }

    /** Set visual signature coordinates per signatory. */
    @PostMapping("/placements")
    public ResponseEntity<?> setPlacements(@RequestBody SetPlacementsRequest req,
                                            HttpSession session) {
        SigningSessionData data = getOrCreate(session);
        if (data.getSignatories() == null || data.getSignatories().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Configure signatories first"));
        }
        if (req.getPlacements() == null || req.getPlacements().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "At least one placement required"));
        }

        Set<String> expectedSignatoryIds = data.getSignatories().stream()
            .map(Signatory::getId)
            .collect(Collectors.toSet());
        Set<String> seen = new HashSet<>();

        for (SignatoryPlacement p : req.getPlacements()) {
            if (p.getSignatoryId() == null || p.getSignatoryId().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "placement.signatoryId is required"));
            }
            if (!expectedSignatoryIds.contains(p.getSignatoryId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Placement contains unknown signatoryId: " + p.getSignatoryId()));
            }
            if (!seen.add(p.getSignatoryId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Each signatory must have exactly one placement"));
            }
            if (p.getPage() < 1 || p.getWidth() <= 0 || p.getHeight() <= 0 || p.getX() < 0 || p.getY() < 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid placement coordinates"));
            }
        }

        if (seen.size() != expectedSignatoryIds.size()) {
            return ResponseEntity.badRequest().body(Map.of("error", "All signatories must have a placement"));
        }

        data.setPlacements(req.getPlacements());
        data.setStep("PRICING");
        save(session, data);

        return ResponseEntity.ok(Map.of("placements", req.getPlacements()));
    }

    /** Enable or disable AI analysis addon (CHF 1.00). */
    @PostMapping({"/analysis", "/analysis/select"})
    public ResponseEntity<?> selectAnalysis(@RequestParam(value = "enabled", defaultValue = "true") boolean enabled,
                                            HttpSession session) {
        SigningSessionData data = getOrCreate(session);
        if (enabled && (data.getDocumentRef() == null || data.getDocumentRef().isBlank())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Upload a document first"));
        }

        data.setContractAnalysisRequested(enabled);
        if (!enabled) {
            resetAnalysisState(data);
        } else {
            data.setAnalysisError(null);
            if (!"QUEUED".equals(data.getAnalysisStatus())
                && !"RUNNING".equals(data.getAnalysisStatus())
                && !"COMPLETED".equals(data.getAnalysisStatus())) {
                data.setAnalysisStatus("PENDING_PAYMENT");
            }
        }

        if (data.getSignatories() != null && !data.getSignatories().isEmpty()) {
            data.setPrice(pricingService.calculate(
                data.getSignatories().size(),
                data.getSignatureLevel(),
                enabled
            ));
        }
        save(session, data);

        Map<String, Object> response = new HashMap<>();
        response.put("analysisRequested", data.isContractAnalysisRequested());
        response.put("analysisPriceGross", 1.00);
        response.put("analysisPriceCurrency", "CHF");
        response.put("analysisIncludedInInvoice", data.isContractAnalysisRequested());
        response.put("analysisStatus", data.getAnalysisStatus() == null ? "NOT_REQUESTED" : data.getAnalysisStatus());
        if (data.getPrice() != null) {
            response.put("price", data.getPrice());
        }
        return ResponseEntity.ok(response);
    }

    /** Starts async AI analysis job (normally triggered automatically after payment). */
    @PostMapping("/analysis/start")
    public ResponseEntity<?> startAnalysis(@RequestParam(value = "language", defaultValue = "auto") String language,
                                           @RequestParam(value = "jurisdiction_hint", required = false) String jurisdictionHint,
                                           @RequestParam(value = "party_role", required = false) String partyRole,
                                           @RequestParam(value = "analysis_profile", defaultValue = "standard") String analysisProfile,
                                           HttpSession session) {
        SigningSessionData data = getOrCreate(session);
        updatePreferredLanguage(data, language);
        if (!"COMPLETED".equals(data.getPaymentStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Payment required first"));
        }
        if (!data.isContractAnalysisRequested()) {
            return ResponseEntity.badRequest().body(Map.of("error", "AI analysis addon not selected"));
        }
        if (data.getDocumentRef() == null || data.getDocumentRef().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Upload a document first"));
        }

        String analysisProcessId = data.getAnalysisProcessId();
        if (analysisProcessId == null || analysisProcessId.isBlank()) {
            analysisProcessId = "analysis-" + UUID.randomUUID().toString().replace("-", "");
            data.setAnalysisProcessId(analysisProcessId);
        }

        ContractAnalysisJobService.AnalysisJob job = contractAnalysisJobService.startJob(
            analysisProcessId,
            fileStorageService.resolve(data.getDocumentRef()),
            data.getDocumentName(),
            new ContractAnalyzeOptions(resolveAnalysisLanguage(data, language), jurisdictionHint, partyRole, analysisProfile, "consensus3")
        );
        data.setAnalysisStatus(job.getStatus());
        data.setAnalysisError(job.getError());
        save(session, data);

        return ResponseEntity.ok(analysisStatusResponse(data, job));
    }

    /** Returns async AI analysis status and compact result if ready. */
    @GetMapping("/analysis/status")
    public ResponseEntity<?> analysisStatus(@RequestParam(value = "analyticProcessID", required = false) String analyticProcessId,
                                            HttpSession session) {
        SigningSessionData data = getOrCreate(session);
        String requestedId = normalizeId(analyticProcessId);
        if (requestedId != null) {
            ContractAnalysisJobService.AnalysisJob requestedJob = contractAnalysisJobService.getJob(requestedId);
            if (requestedJob == null) {
                return ResponseEntity.status(404).body(Map.of(
                    "error", "Analysis process not found",
                    "analyticProcessID", requestedId
                ));
            }
            Map<String, Object> response = analysisStatusResponseForJob(requestedId, requestedJob);
            response.put("status", response.get("analysisStatus"));
            return ResponseEntity.ok(response);
        }

        if (!data.isContractAnalysisRequested()) {
            return ResponseEntity.ok(Map.of(
                "analysisRequested", false,
                "status", "NOT_REQUESTED"
            ));
        }

        syncAnalysisState(data);
        save(session, data);
        Map<String, Object> response = analysisStatusResponse(data, contractAnalysisJobService.getJob(data.getAnalysisProcessId()));
        response.put("status", response.get("analysisStatus"));
        return ResponseEntity.ok(response);
    }

    /** Downloads AI analysis report PDF after async job completion. */
    @GetMapping("/analysis/report")
    public ResponseEntity<?> analysisReport(@RequestParam(value = "analyticProcessID", required = false) String analyticProcessId,
                                            @RequestParam(value = "lang", required = false) String lang,
                                            HttpSession session) {
        SigningSessionData data = getOrCreate(session);
        updatePreferredLanguage(data, lang);
        save(session, data);

        String requestedId = normalizeId(analyticProcessId);
        String effectiveAnalysisId = requestedId != null ? requestedId : normalizeId(data.getAnalysisProcessId());
        if (effectiveAnalysisId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "analyticProcessID is required"));
        }

        ContractAnalysisJobService.AnalysisJob job = contractAnalysisJobService.getJob(effectiveAnalysisId);
        String effectiveStatus = null;
        Map<String, Object> effectiveResult = null;
        if (job != null) {
            effectiveStatus = job.getStatus();
            if ("COMPLETED".equals(job.getStatus()) && job.getResult() != null) {
                effectiveResult = compactAnalysisForSession(job.getResult());
            }
        } else if (effectiveAnalysisId.equals(normalizeId(data.getAnalysisProcessId()))) {
            syncAnalysisState(data);
            save(session, data);
            effectiveStatus = data.getAnalysisStatus();
            effectiveResult = data.getContractAnalysisResult();
        } else {
            return ResponseEntity.status(404).body(Map.of(
                "error", "Analysis process not found",
                "analyticProcessID", effectiveAnalysisId
            ));
        }

        if (!"COMPLETED".equals(effectiveStatus) || effectiveResult == null) {
            return ResponseEntity.status(409).body(Map.of(
                "error", "Analysis is not ready yet",
                "status", effectiveStatus == null ? "PENDING_PAYMENT" : effectiveStatus,
                "analyticProcessID", effectiveAnalysisId
            ));
        }

        try {
            byte[] pdf = analysisReportPdfService.createReport(
                effectiveAnalysisId,
                effectiveResult,
                resolveAnalysisLanguage(data, lang)
            );
            String filename = buildAnalysisFilename(effectiveAnalysisId);
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
        } catch (IOException ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to generate analysis report PDF"));
        }
    }

    /** Downloads a PDF confirmation for an AI analysis process id. */
    @GetMapping("/analysis/confirmation")
    public ResponseEntity<?> analysisConfirmation(@RequestParam(value = "analyticProcessID", required = false) String analyticProcessId,
                                                  @RequestParam(value = "lang", required = false) String lang,
                                                  HttpSession session,
                                                  HttpServletRequest request) {
        SigningSessionData data = getOrCreate(session);
        updatePreferredLanguage(data, lang);
        save(session, data);

        String requestedId = normalizeId(analyticProcessId);
        String effectiveAnalysisId = requestedId != null ? requestedId : normalizeId(data.getAnalysisProcessId());
        if (effectiveAnalysisId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "analyticProcessID is required"));
        }

        ContractAnalysisJobService.AnalysisJob job = contractAnalysisJobService.getJob(effectiveAnalysisId);
        String effectiveStatus = "UNKNOWN";
        Map<String, Object> effectiveResult = null;
        if (job != null) {
            effectiveStatus = job.getStatus();
            if ("COMPLETED".equals(job.getStatus()) && job.getResult() != null) {
                effectiveResult = compactAnalysisForSession(job.getResult());
            }
        } else if (effectiveAnalysisId.equals(normalizeId(data.getAnalysisProcessId()))) {
            syncAnalysisState(data);
            save(session, data);
            effectiveStatus = data.getAnalysisStatus() == null ? "UNKNOWN" : data.getAnalysisStatus();
            effectiveResult = data.getContractAnalysisResult();
        }

        String statusUrl = resolveOrigin(request)
            + "/status?analyticProcessID="
            + URLEncoder.encode(effectiveAnalysisId, StandardCharsets.UTF_8).replace("+", "%20");
        try {
            byte[] pdf = analysisConfirmationPdfService.createConfirmation(
                effectiveAnalysisId,
                effectiveStatus,
                statusUrl,
                resolveAnalysisLanguage(data, lang),
                effectiveResult
            );
            String filename = buildAnalysisConfirmationFilename(effectiveAnalysisId);
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
        } catch (IOException ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to generate analysis confirmation PDF"));
        }
    }

    /** Process payment (mock or real Stripe depending on stripe.mock). */
    @PostMapping("/pay")
    public ResponseEntity<?> pay(@RequestParam(value = "lang", required = false) String lang,
                                 HttpSession session,
                                 HttpServletRequest request) {
        SigningSessionData data = getOrCreate(session);
        updatePreferredLanguage(data, lang);
        if (data.getSignatories().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Configure signatories first"));
        }
        if (data.getPlacements() == null || data.getPlacements().size() != data.getSignatories().size()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Place all signatories first"));
        }
        if (data.getPrice() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Price not calculated"));
        }

        String origin = resolveOrigin(request);
        String successUrl = origin + "/sign?stripe=success&session_id={CHECKOUT_SESSION_ID}";
        String cancelUrl = origin + "/sign?stripe=cancel";

        Map<String, String> result = paymentService.createCheckoutSession(
            data.getPrice(),
            data.getSignatureLevel(),
            successUrl,
            cancelUrl,
            session.getId()
        );
        data.setPaymentSessionId(result.get("sessionId"));
        data.setPaymentStatus("success".equals(result.get("status")) ? "COMPLETED" : "PENDING");
        if ("COMPLETED".equals(data.getPaymentStatus())) {
            ensureAnalysisJobStartedIfRequested(data);
            syncAnalysisState(data);
        }
        data.setStep("PAYMENT");
        save(session, data);
        Map<String, Object> response = new HashMap<>(result);
        response.putAll(analysisStatusResponse(data, contractAnalysisJobService.getJob(data.getAnalysisProcessId())));
        return ResponseEntity.ok(response);
    }

    /** Confirm payment status after returning from Stripe Checkout. */
    @GetMapping("/pay/confirm")
    public ResponseEntity<?> confirmPayment(@RequestParam(value = "sessionId", required = false) String sessionId,
                                            @RequestParam(value = "lang", required = false) String lang,
                                            HttpSession session) {
        SigningSessionData data = getOrCreate(session);
        updatePreferredLanguage(data, lang);
        if (data.getPaymentSessionId() == null || data.getPaymentSessionId().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No payment session found"));
        }

        String effectiveSessionId = (sessionId != null && !sessionId.isBlank())
            ? sessionId
            : data.getPaymentSessionId();

        if (!data.getPaymentSessionId().equals(effectiveSessionId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Payment session mismatch"));
        }

        Map<String, String> result = paymentService.getCheckoutStatus(effectiveSessionId);
        String status = result.getOrDefault("status", "pending");
        Map<String, Object> response = new HashMap<>(result);

        if ("success".equals(status)) {
            data.setPaymentStatus("COMPLETED");
            try {
                ensureAnalysisJobStartedIfRequested(data);
                syncAnalysisState(data);
                triggerInvitationsIfNeeded(data);
                response.put("documentName", data.getDocumentName());
                response.put("processId", data.getProcessId());
                response.put("invitations", data.getInvitations());
            } catch (RuntimeException ex) {
                String errorRef = UUID.randomUUID().toString();
                swisscomLog.error(
                    "SWISSCOM_TRACE event=confirm_failed ref={} paymentSessionId={} httpSessionId={} documentRef={}",
                    errorRef,
                    data.getPaymentSessionId(),
                    session.getId(),
                    data.getDocumentRef(),
                    ex
                );
                data.setStep("PAYMENT");
                save(session, data);
                return ResponseEntity.status(502).body(Map.of(
                    "error", "Payment confirmed, but signing process start failed: " + ex.getMessage(),
                    "errorRef", errorRef
                ));
            }
        } else if ("cancelled".equals(status)) {
            data.setPaymentStatus("FAILED");
            data.setStep("PAYMENT");
        } else {
            data.setPaymentStatus("PENDING");
            data.setStep("PAYMENT");
        }

        response.putAll(analysisStatusResponse(data, contractAnalysisJobService.getJob(data.getAnalysisProcessId())));
        save(session, data);
        return ResponseEntity.ok(response);
    }

    /** Send signing invitations (mock or real Swisscom Sign depending on swisscom.sign.mock). */
    @PostMapping("/invite")
    public ResponseEntity<?> invite(@RequestParam(value = "lang", required = false) String lang,
                                    HttpSession session) {
        SigningSessionData data = getOrCreate(session);
        updatePreferredLanguage(data, lang);
        if (!"COMPLETED".equals(data.getPaymentStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Payment required first"));
        }

        try {
            ensureAnalysisJobStartedIfRequested(data);
            syncAnalysisState(data);
            triggerInvitationsIfNeeded(data);
            save(session, data);
            return ResponseEntity.ok(inviteResponse(data));
        } catch (RuntimeException ex) {
            String errorRef = UUID.randomUUID().toString();
            swisscomLog.error(
                "SWISSCOM_TRACE event=invite_failed ref={} paymentSessionId={} httpSessionId={} documentRef={}",
                errorRef,
                data.getPaymentSessionId(),
                session.getId(),
                data.getDocumentRef(),
                ex
            );
            data.setStep("PAYMENT");
            save(session, data);
            return ResponseEntity.status(502).body(Map.of(
                "error", "Signing process start failed: " + ex.getMessage(),
                "errorRef", errorRef
            ));
        }
    }

    /** Reads current Swisscom process status for a process id. */
    @GetMapping("/status")
    public ResponseEntity<?> processStatus(@RequestParam(value = "processId", required = false) String processId,
                                           HttpSession session) {
        SigningSessionData data = getOrCreate(session);
        String effectiveProcessId = (processId != null && !processId.isBlank())
            ? processId.trim()
            : data.getProcessId();
        if (effectiveProcessId == null || effectiveProcessId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "processId is required"));
        }
        try {
            return ResponseEntity.ok(signInviteService.getProcessStatus(effectiveProcessId));
        } catch (RuntimeException ex) {
            String errorRef = UUID.randomUUID().toString();
            swisscomLog.error(
                "SWISSCOM_TRACE event=status_failed ref={} processId={} httpSessionId={}",
                errorRef,
                effectiveProcessId,
                session.getId(),
                ex
            );
            return ResponseEntity.status(502).body(Map.of(
                "error", "Status query failed: " + ex.getMessage(),
                "errorRef", errorRef
            ));
        }
    }

    /** Returns a branded PDF that confirms the process start. */
    @GetMapping("/confirmation")
    public ResponseEntity<?> processConfirmation(@RequestParam(value = "processId", required = false) String processId,
                                                 @RequestParam(value = "lang", required = false) String lang,
                                                 HttpSession session,
                                                 HttpServletRequest request) {
        SigningSessionData data = getOrCreate(session);
        String effectiveProcessId = (processId != null && !processId.isBlank())
            ? processId.trim()
            : data.getProcessId();
        if (effectiveProcessId == null || effectiveProcessId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "processId is required"));
        }
        try {
            syncAnalysisState(data);
            String statusUrl = resolveOrigin(request)
                + "/status?processId="
                + URLEncoder.encode(effectiveProcessId, StandardCharsets.UTF_8).replace("+", "%20");
            byte[] pdf = confirmationPdfService.createProcessStartConfirmation(
                effectiveProcessId,
                statusUrl,
                lang,
                data.getContractAnalysisResult()
            );
            save(session, data);
            String filename = buildConfirmationFilename(effectiveProcessId);
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
        } catch (IOException ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to generate confirmation PDF"));
        }
    }

    /** Returns current session state. */
    @GetMapping("/state")
    public ResponseEntity<?> state(@RequestParam(value = "lang", required = false) String lang,
                                   HttpSession session) {
        SigningSessionData data = getOrCreate(session);
        updatePreferredLanguage(data, lang);
        syncAnalysisState(data);
        save(session, data);
        return ResponseEntity.ok(data);
    }

    // --- helpers ---

    private SigningSessionData getOrCreate(HttpSession session) {
        SigningSessionData data = (SigningSessionData) session.getAttribute(SESSION_KEY);
        return data != null ? data : new SigningSessionData();
    }

    private void save(HttpSession session, SigningSessionData data) {
        session.setAttribute(SESSION_KEY, data);
    }

    private String normalizeSignatureLevel(String level) {
        if (level == null || level.isBlank()) {
            return Signatory.LEVEL_QES;
        }
        String normalized = level.trim().toUpperCase(Locale.ROOT);
        if ("SIMPLE".equals(normalized) || "SES".equals(normalized)) {
            return Signatory.LEVEL_SIMPLE;
        }
        if ("AES".equals(normalized) || "ADVANCED".equals(normalized)) {
            return Signatory.LEVEL_AES;
        }
        if ("QES".equals(normalized) || "QUALIFIED".equals(normalized)) {
            return Signatory.LEVEL_QES;
        }
        return null;
    }

    private boolean isPdfFile(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        if (contentType != null) {
            String normalized = contentType.trim().toLowerCase();
            if ("application/pdf".equals(normalized) || "application/x-pdf".equals(normalized)) {
                return true;
            }
        }

        byte[] header = file.getInputStream().readNBytes(5);
        if (header.length < 5) {
            return false;
        }

        return header[0] == '%' && header[1] == 'P' && header[2] == 'D' && header[3] == 'F' && header[4] == '-';
    }

    private void triggerInvitationsIfNeeded(SigningSessionData data) {
        if (data.getInvitations() != null && !data.getInvitations().isEmpty()) {
            data.setStep("DONE");
            return;
        }
        InviteDispatchResult dispatch = signInviteService.sendInvitations(
            data.getDocumentRef(),
            data.getDocumentName(),
            data.getPaymentSessionId(),
            data.getSignatories(),
            data.getPlacements(),
            null
        );
        data.setProcessId(dispatch.getProcessId());
        data.setInvitations(dispatch.getInvitations());
        data.setStep("DONE");
    }

    private void resetProcessState(SigningSessionData data) {
        data.setProcessId(null);
        data.setPaymentSessionId(null);
        data.setPaymentStatus(null);
        data.setInvitations(List.of());
    }

    private void resetAnalysisState(SigningSessionData data) {
        data.setAnalysisProcessId(null);
        data.setAnalysisStatus("NOT_REQUESTED");
        data.setAnalysisError(null);
        data.setContractAnalysisResult(null);
    }

    private void ensureAnalysisJobStartedIfRequested(SigningSessionData data) {
        if (!data.isContractAnalysisRequested()) {
            if (data.getAnalysisStatus() == null) {
                data.setAnalysisStatus("NOT_REQUESTED");
            }
            return;
        }
        if (data.getDocumentRef() == null || data.getDocumentRef().isBlank()) {
            data.setAnalysisStatus("FAILED");
            data.setAnalysisError("Uploaded PDF not found");
            return;
        }

        syncAnalysisState(data);
        if ("QUEUED".equals(data.getAnalysisStatus())
            || "RUNNING".equals(data.getAnalysisStatus())
            || "COMPLETED".equals(data.getAnalysisStatus())) {
            return;
        }

        String analysisProcessId = data.getAnalysisProcessId();
        if (analysisProcessId == null || analysisProcessId.isBlank()) {
            analysisProcessId = "analysis-" + UUID.randomUUID().toString().replace("-", "");
            data.setAnalysisProcessId(analysisProcessId);
        }

        ContractAnalysisJobService.AnalysisJob job = contractAnalysisJobService.startJob(
            analysisProcessId,
            fileStorageService.resolve(data.getDocumentRef()),
            data.getDocumentName(),
            new ContractAnalyzeOptions(resolveAnalysisLanguage(data, null), null, null, "standard", "consensus3")
        );
        data.setAnalysisStatus(job.getStatus());
        data.setAnalysisError(job.getError());
    }

    private void updatePreferredLanguage(SigningSessionData data, String language) {
        String normalized = normalizeFrontendLanguage(language);
        if (normalized != null) {
            data.setPreferredLanguage(normalized);
        } else if (data.getPreferredLanguage() == null || data.getPreferredLanguage().isBlank()) {
            data.setPreferredLanguage("de");
        }
    }

    private String resolveAnalysisLanguage(SigningSessionData data, String requestedLanguage) {
        String normalizedRequested = normalizeFrontendLanguage(requestedLanguage);
        if (normalizedRequested != null) {
            return normalizedRequested;
        }
        String preferred = normalizeFrontendLanguage(data.getPreferredLanguage());
        return preferred != null ? preferred : "de";
    }

    private String normalizeFrontendLanguage(String language) {
        if (language == null || language.isBlank()) {
            return null;
        }
        String normalized = language.trim().toLowerCase(Locale.ROOT);
        if ("auto".equals(normalized)) {
            return null;
        }
        if (normalized.startsWith("de")) {
            return "de";
        }
        if (normalized.startsWith("en")) {
            return "en";
        }
        if (normalized.startsWith("fr")) {
            return "fr";
        }
        return null;
    }

    private void syncAnalysisState(SigningSessionData data) {
        if (data.getAnalysisProcessId() == null || data.getAnalysisProcessId().isBlank()) {
            if (data.isContractAnalysisRequested() && data.getAnalysisStatus() == null) {
                data.setAnalysisStatus("PENDING_PAYMENT");
            }
            if (!data.isContractAnalysisRequested() && data.getAnalysisStatus() == null) {
                data.setAnalysisStatus("NOT_REQUESTED");
            }
            return;
        }

        ContractAnalysisJobService.AnalysisJob job = contractAnalysisJobService.getJob(data.getAnalysisProcessId());
        if (job == null) {
            if (data.getAnalysisStatus() == null) {
                data.setAnalysisStatus(data.isContractAnalysisRequested() ? "PENDING_PAYMENT" : "NOT_REQUESTED");
            }
            return;
        }

        data.setAnalysisStatus(job.getStatus());
        if ("COMPLETED".equals(job.getStatus()) && job.getResult() != null) {
            data.setContractAnalysisResult(compactAnalysisForSession(job.getResult()));
            data.setAnalysisError(null);
        } else if ("FAILED".equals(job.getStatus())) {
            data.setAnalysisError(job.getError() == null ? "AI analysis failed" : job.getError());
        }
    }

    private Map<String, Object> compactAnalysisForSession(Map<String, Object> analysis) {
        Map<String, Object> compact = new HashMap<>();
        if (analysis == null) {
            return compact;
        }
        compact.put("summary", analysis.get("summary"));
        compact.put("key_dates", analysis.get("key_dates"));
        compact.put("obligations", analysis.get("obligations"));
        compact.put("risks", analysis.get("risks"));
        compact.put("opportunities", analysis.get("opportunities"));
        compact.put("open_questions", analysis.get("open_questions"));
        compact.put("confidence", analysis.get("confidence"));
        compact.put("consensus", analysis.get("consensus"));
        compact.put("generated_at", analysis.get("generated_at"));
        return compact;
    }

    private Map<String, Object> inviteResponse(SigningSessionData data) {
        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", data.getPaymentSessionId());
        response.put("documentName", data.getDocumentName());
        response.put("invitations", data.getInvitations());
        response.put("processId", data.getProcessId());
        response.putAll(analysisStatusResponse(data, contractAnalysisJobService.getJob(data.getAnalysisProcessId())));
        return response;
    }

    private Map<String, Object> analysisStatusResponse(SigningSessionData data, ContractAnalysisJobService.AnalysisJob job) {
        Map<String, Object> response = new HashMap<>();
        response.put("analysisRequested", data.isContractAnalysisRequested());

        String status = data.getAnalysisStatus();
        if (status == null || status.isBlank()) {
            status = data.isContractAnalysisRequested() ? "PENDING_PAYMENT" : "NOT_REQUESTED";
        }
        response.put("analysisStatus", status);

        if (data.getAnalysisProcessId() != null && !data.getAnalysisProcessId().isBlank()) {
            response.put("analyticProcessID", data.getAnalysisProcessId());
        }
        if (data.getAnalysisError() != null && !data.getAnalysisError().isBlank()) {
            response.put("analysisError", data.getAnalysisError());
        }
        if ("COMPLETED".equals(status) && data.getContractAnalysisResult() != null) {
            response.put("analysis", data.getContractAnalysisResult());
        }
        if (job != null && job.getStartedAt() != null) {
            response.put("analysisStartedAt", job.getStartedAt().toString());
        }
        if (job != null && job.getCompletedAt() != null) {
            response.put("analysisCompletedAt", job.getCompletedAt().toString());
        }
        if (job != null) {
            response.put("analysisStepKey", job.getStepKey());
            response.put("analysisStepIndex", job.getStepIndex());
            response.put("analysisStepTotal", job.getStepTotal());
        } else if ("PENDING_PAYMENT".equals(status)) {
            response.put("analysisStepKey", "PENDING_PAYMENT");
            response.put("analysisStepIndex", 0);
            response.put("analysisStepTotal", ContractAnalysisService.TOTAL_ANALYSIS_STEPS);
        }
        return response;
    }

    private Map<String, Object> analysisStatusResponseForJob(String analysisProcessId,
                                                             ContractAnalysisJobService.AnalysisJob job) {
        Map<String, Object> response = new HashMap<>();
        response.put("analysisRequested", true);
        response.put("analysisStatus", job == null ? "UNKNOWN" : job.getStatus());
        response.put("analyticProcessID", analysisProcessId);
        if (job != null && job.getError() != null && !job.getError().isBlank()) {
            response.put("analysisError", job.getError());
        }
        if (job != null && "COMPLETED".equals(job.getStatus()) && job.getResult() != null) {
            response.put("analysis", compactAnalysisForSession(job.getResult()));
        }
        if (job != null && job.getStartedAt() != null) {
            response.put("analysisStartedAt", job.getStartedAt().toString());
        }
        if (job != null && job.getCompletedAt() != null) {
            response.put("analysisCompletedAt", job.getCompletedAt().toString());
        }
        if (job != null) {
            response.put("analysisStepKey", job.getStepKey());
            response.put("analysisStepIndex", job.getStepIndex());
            response.put("analysisStepTotal", job.getStepTotal());
        }
        return response;
    }

    private String buildConfirmationFilename(String processId) {
        String date = LocalDate.now().toString();
        String safeProcessId = processId.replaceAll("[^a-zA-Z0-9._-]", "_");
        if (safeProcessId.length() > 64) {
            safeProcessId = safeProcessId.substring(0, 64);
        }
        return "justSign-confirmation-" + date + "-" + safeProcessId + ".pdf";
    }

    private String buildAnalysisFilename(String analysisProcessId) {
        String date = LocalDate.now().toString();
        String safeId = analysisProcessId.replaceAll("[^a-zA-Z0-9._-]", "_");
        if (safeId.length() > 64) {
            safeId = safeId.substring(0, 64);
        }
        return "justSign-analysis-" + date + "-" + safeId + ".pdf";
    }

    private String buildAnalysisConfirmationFilename(String analysisProcessId) {
        String date = LocalDate.now().toString();
        String safeId = analysisProcessId.replaceAll("[^a-zA-Z0-9._-]", "_");
        if (safeId.length() > 64) {
            safeId = safeId.substring(0, 64);
        }
        return "justSign-analysis-confirmation-" + date + "-" + safeId + ".pdf";
    }

    private String normalizeId(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String resolveOrigin(HttpServletRequest request) {
        String origin = request.getHeader("Origin");
        if (origin != null && !origin.isBlank()) {
            return origin;
        }

        String scheme = request.getHeader("X-Forwarded-Proto");
        if (scheme == null || scheme.isBlank()) {
            scheme = request.getScheme();
        }

        String host = request.getHeader("X-Forwarded-Host");
        if (host == null || host.isBlank()) {
            host = request.getHeader("Host");
        }
        if (host != null && !host.isBlank()) {
            return scheme + "://" + host;
        }

        int port = request.getServerPort();
        boolean defaultPort = ("http".equalsIgnoreCase(scheme) && port == 80)
            || ("https".equalsIgnoreCase(scheme) && port == 443);
        return scheme + "://" + request.getServerName() + (defaultPort ? "" : ":" + port);
    }

    // --- request body ---

    public static class SetSignatoriesRequest {
        private List<Signatory> signatories;
        private String signatureLevel;
        public List<Signatory> getSignatories() { return signatories; }
        public void setSignatories(List<Signatory> signatories) { this.signatories = signatories; }
        public String getSignatureLevel() { return signatureLevel; }
        public void setSignatureLevel(String signatureLevel) { this.signatureLevel = signatureLevel; }
    }

    public static class SetPlacementsRequest {
        private List<SignatoryPlacement> placements;
        public List<SignatoryPlacement> getPlacements() { return placements; }
        public void setPlacements(List<SignatoryPlacement> placements) { this.placements = placements; }
    }

}
