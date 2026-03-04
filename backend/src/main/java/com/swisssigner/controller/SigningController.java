package com.swisssigner.controller;

import com.swisssigner.model.*;
import com.swisssigner.service.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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

    public SigningController(PricingService pricingService,
                             FileStorageService fileStorageService,
                             PaymentService paymentService,
                             SignInviteService signInviteService) {
        this.pricingService = pricingService;
        this.fileStorageService = fileStorageService;
        this.paymentService = paymentService;
        this.signInviteService = signInviteService;
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

        PriceBreakdown price = pricingService.calculate(req.getSignatories().size());
        data.setSignatories(req.getSignatories());
        data.setSignatureLevel(normalizedDocumentLevel);
        data.setPlacements(List.of());
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

    /** Process payment (mock or real Stripe depending on stripe.mock). */
    @PostMapping("/pay")
    public ResponseEntity<?> pay(HttpSession session, HttpServletRequest request) {
        SigningSessionData data = getOrCreate(session);
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
            data.getPrice().getTotal(),
            successUrl,
            cancelUrl,
            session.getId()
        );
        data.setPaymentSessionId(result.get("sessionId"));
        data.setPaymentStatus("success".equals(result.get("status")) ? "COMPLETED" : "PENDING");
        data.setStep("PAYMENT");
        save(session, data);

        return ResponseEntity.ok(result);
    }

    /** Confirm payment status after returning from Stripe Checkout. */
    @GetMapping("/pay/confirm")
    public ResponseEntity<?> confirmPayment(@RequestParam(value = "sessionId", required = false) String sessionId,
                                            HttpSession session) {
        SigningSessionData data = getOrCreate(session);
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
                triggerInvitationsIfNeeded(data);
                response.put("documentName", data.getDocumentName());
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

        save(session, data);
        return ResponseEntity.ok(response);
    }

    /** Send signing invitations (mock or real Swisscom Sign depending on swisscom.sign.mock). */
    @PostMapping("/invite")
    public ResponseEntity<?> invite(HttpSession session) {
        SigningSessionData data = getOrCreate(session);
        if (!"COMPLETED".equals(data.getPaymentStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Payment required first"));
        }

        try {
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

    /** Returns current session state. */
    @GetMapping("/state")
    public ResponseEntity<?> state(HttpSession session) {
        SigningSessionData data = getOrCreate(session);
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
        List<InvitationResult> invitations = signInviteService.sendInvitations(
            data.getDocumentRef(),
            data.getDocumentName(),
            data.getPaymentSessionId(),
            data.getSignatories(),
            data.getPlacements()
        );
        data.setInvitations(invitations);
        data.setStep("DONE");
    }

    private Map<String, Object> inviteResponse(SigningSessionData data) {
        return Map.of(
            "sessionId", data.getPaymentSessionId(),
            "documentName", data.getDocumentName(),
            "invitations", data.getInvitations()
        );
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
