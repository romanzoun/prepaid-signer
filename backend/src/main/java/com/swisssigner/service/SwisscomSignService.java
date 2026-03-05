package com.swisssigner.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.swisssigner.config.SwisscomSignProperties;
import com.swisssigner.model.InviteDispatchResult;
import com.swisssigner.model.InvitationResult;
import com.swisssigner.model.InitiatorSelection;
import com.swisssigner.model.Signatory;
import com.swisssigner.model.SignatoryPlacement;
import jakarta.annotation.PostConstruct;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.zip.CRC32;

/**
 * Real Swisscom Sign integration – active when swisscom.sign.mock=false.
 *
 * Flow per signing session:
 *   1. Obtain Bearer token via OAuth2 Client Credentials
 *   2. POST /process              → processId
 *   3. POST /process/{id}/attach  → attach PDF + signaturePositions
 *   4. POST /process/{id}/release → starts process + returns participant URLs
 *   5. Optional fallback: POST /process/{id}/open/{personId}
 */
@Service
@ConditionalOnProperty(name = "swisscom.sign.mock", havingValue = "false")
public class SwisscomSignService implements SignInviteService {

    private static final Logger log = LoggerFactory.getLogger(SwisscomSignService.class);
    private static final Logger swisscomLog = LoggerFactory.getLogger("com.swisssigner.swisscom");
    private static final String DEFAULT_LANGUAGE = "de-CH";
    private static final int SIGNER_EXTERNAL_IDENTIFIER_MAX = 50;
    private static final int PROCESS_PROPERTY_VALUE_MAX = 64;

    private final SwisscomSignProperties props;
    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient http = HttpClient.newHttpClient();
    @Value("${app.upload-dir:/tmp/swisssigner}")
    private String uploadDir;
    @Value("${app.swisscom-sign-debug.enabled:false}")
    private boolean swisscomSignDebugEnabled;
    @Value("${app.swisscom-sign-debug.file:}")
    private String swisscomSignDebugFile;
    private final Object swisscomDebugFileLock = new Object();

    // Simple in-memory token cache
    private volatile String cachedToken;
    private volatile Instant tokenExpiry = Instant.EPOCH;

    public SwisscomSignService(SwisscomSignProperties props) {
        this.props = props;
    }

    @PostConstruct
    void logInitialization() {
        if (swisscomSignDebugEnabled) {
            ensureSwisscomDebugFileExists();
        }
        swisscomLog.info(
            "SWISSCOM_TRACE event=service_initialized debugEnabled={} debugFile={} apiUrl={} tokenUrl={}",
            swisscomSignDebugEnabled,
            resolveSwisscomDebugFilePath(),
            props.getApiUrl(),
            props.getTokenUrl()
        );
    }

    @Override
    public InviteDispatchResult sendInvitations(String documentRef,
                                                String documentName,
                                                String paymentRef,
                                                List<Signatory> signatories,
                                                List<SignatoryPlacement> placements,
                                                InitiatorSelection initiatorSelection) {
        try {
            swisscomLog.info(
                "SWISSCOM_TRACE event=flow_started paymentRef={} signatoryCount={} placementCount={}",
                safeRef(paymentRef),
                signatories == null ? 0 : signatories.size(),
                placements == null ? 0 : placements.size()
            );
            String token = getAccessToken();
            Path pdfPath = resolveDocumentPath(documentRef);
            swisscomLog.info("SWISSCOM_TRACE event=pdf_resolved paymentRef={} path={}", safeRef(paymentRef), pdfPath);
            Map<Integer, Integer> pageHeights = readPageHeights(pdfPath);
            Map<String, String> signerExternalIds = buildSignerExternalIdentifiers(signatories);
            InitiatorPayload initiator = resolveInitiator(initiatorSelection, signatories, signerExternalIds, paymentRef);

            // 1. Create process
            String processId = createProcess(token, documentName, paymentRef, signatories, signerExternalIds, initiator);
            swisscomLog.info("SWISSCOM_TRACE event=create_process_ok paymentRef={} processId={}", safeRef(paymentRef), processId);
            log.info("Swisscom: process created – id={}", processId);

            // 2. Attach PDF
            attachDocument(token, processId, pdfPath, documentName, placements, pageHeights, signerExternalIds);
            swisscomLog.info("SWISSCOM_TRACE event=attach_ok paymentRef={} processId={}", safeRef(paymentRef), processId);
            log.info("Swisscom: PDF attached – processId={}", processId);

            // 3. Release (start signing + send email notifications when at least one participant has email)
            Map<String, String> releaseUrls = releaseProcess(
                token,
                processId,
                shouldSendNotifications(signatories, initiator),
                signatories,
                signerExternalIds,
                initiator
            );
            swisscomLog.info("SWISSCOM_TRACE event=release_ok paymentRef={} processId={}", safeRef(paymentRef), processId);
            log.info("Swisscom: process released – processId={}", processId);

            // 4. Build invitation URLs per signatory (from release response; fallback /open)
            List<InvitationResult> results = new ArrayList<>();
            for (Signatory s : signatories) {
                String signerExternalId = signerExternalIds.getOrDefault(s.getId(), normalizeSignerIdentifier(s.getId()));
                String inviteUrl = releaseUrls.get(signerExternalId);
                if (inviteUrl == null || inviteUrl.isBlank()) {
                    inviteUrl = releaseUrls.get(s.getId());
                }
                if (inviteUrl == null || inviteUrl.isBlank()) {
                    inviteUrl = openForPerson(token, processId, s.getId());
                }
                results.add(new InvitationResult(s, inviteUrl, Instant.now().toString()));
                log.info("Swisscom: invite URL generated for signatory={}", s.getId());
            }

            // After successful Swisscom release/invitation flow, local source PDF is no longer needed.
            deleteLocalPdfQuietly(pdfPath, processId, paymentRef);
            swisscomLog.info("SWISSCOM_TRACE event=flow_done paymentRef={} processId={} invitationCount={}", safeRef(paymentRef), processId, results.size());
            return new InviteDispatchResult(processId, results);

        } catch (Exception e) {
            swisscomLog.error(
                "SWISSCOM_TRACE event=flow_failed paymentRef={} documentRef={} reason={}",
                safeRef(paymentRef),
                documentRef,
                e.getMessage(),
                e
            );
            throw new RuntimeException("Swisscom Sign API call failed: " + e.getMessage(), e);
        }
    }

    @Override
    public Map<String, Object> getProcessStatus(String processId) {
        if (processId == null || processId.isBlank()) {
            throw new RuntimeException("processId is required");
        }
        try {
            String token = getAccessToken();
            String encodedProcessId = URLEncoder.encode(processId.trim(), StandardCharsets.UTF_8).replace("+", "%20");
            HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(props.getApiUrl() + "/process/" + encodedProcessId))
                .header("Authorization", "Bearer " + token)
                .header("Accept", "application/json")
                .GET()
                .build();

            HttpResponse<String> res = sendRequestWithDebug("get_process_status processId=" + processId, req, "");
            if (res.statusCode() != 200) {
                throw new RuntimeException("getProcessStatus failed: HTTP " + res.statusCode() + " – " + res.body());
            }

            JsonNode json = mapper.readTree(res.body());
            String normalizedStatus = firstNonBlank(
                textAt(json, "status"),
                textAt(json, "state"),
                textAt(json, "processStatus"),
                textAt(json.path("process"), "status"),
                textAt(json.path("process"), "state"),
                textAt(json.path("lifecycle"), "status")
            );
            String updatedAt = firstNonBlank(
                textAt(json, "updatedAt"),
                textAt(json, "lastModifiedAt"),
                textAt(json, "modifiedAt"),
                textAt(json.path("process"), "updatedAt")
            );

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("processId", processId.trim());
            response.put("status", normalizedStatus == null ? "UNKNOWN" : normalizedStatus);
            response.put("provider", "swisscom");
            response.put("checkedAt", Instant.now().toString());
            if (updatedAt != null) {
                response.put("updatedAt", updatedAt);
            }
            return response;
        } catch (Exception e) {
            throw new RuntimeException("Swisscom process status query failed: " + e.getMessage(), e);
        }
    }

    // ── OAuth2 Client Credentials ─────────────────────────────────────────────

    private synchronized String getAccessToken() throws IOException, InterruptedException {
        if (cachedToken != null && Instant.now().isBefore(tokenExpiry)) {
            return cachedToken;
        }

        String body = "grant_type=client_credentials"
            + "&client_id=" + URLEncoder.encode(props.getClientId(), StandardCharsets.UTF_8)
            + "&client_secret=" + URLEncoder.encode(props.getClientSecret(), StandardCharsets.UTF_8)
            + "&scope=sswp:process:create sswp:process:read";

        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create(props.getTokenUrl()))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build();

        HttpResponse<String> res = sendRequestWithDebug("token", req, body);
        if (res.statusCode() != 200) {
            throw new RuntimeException("Token request failed: HTTP " + res.statusCode() + " – " + res.body());
        }

        JsonNode json = mapper.readTree(res.body());
        cachedToken = json.get("access_token").asText();
        // Cache for (expires_in - 60) seconds to allow refresh before expiry
        long expiresIn = json.has("expires_in") ? json.get("expires_in").asLong(3600) : 3600;
        tokenExpiry = Instant.now().plusSeconds(expiresIn - 60);
        return cachedToken;
    }

    // ── Swisscom Sign API calls ───────────────────────────────────────────────

    private String createProcess(String token,
                                 String title,
                                 String paymentRef,
                                 List<Signatory> signatories,
                                 Map<String, String> signerExternalIds,
                                 InitiatorPayload initiatorPayload)
            throws IOException, InterruptedException {

        ObjectNode body = mapper.createObjectNode();
        String processSignatureLevel = resolveSwisscomProcessSignatureLevel(signatories);
        body.put("signatureLevel", processSignatureLevel);
        swisscomLog.info("SWISSCOM_TRACE event=signature_level_selected paymentRef={} level={}", safeRef(paymentRef), processSignatureLevel);
        if (title != null && !title.isBlank()) {
            ArrayNode properties = body.putArray("properties");
            ObjectNode prop = properties.addObject();
            String safeTitle = truncate(title, PROCESS_PROPERTY_VALUE_MAX);
            if (!safeTitle.equals(title)) {
                swisscomLog.info(
                    "SWISSCOM_TRACE event=document_name_truncated originalLength={} truncatedLength={}",
                    title.length(),
                    safeTitle.length()
                );
            }
            prop.put("key", "documentName");
            prop.put("value", safeTitle);
        }

        ObjectNode initiator = body.putObject("initiator");
        if (InitiatorPayload.TYPE_SIGNER.equals(initiatorPayload.type)) {
            initiator.put("type", "SIGNER");
            initiator.put("externalIdentifier", initiatorPayload.externalIdentifier);
            initiator.put("firstName", truncate(initiatorPayload.firstName, 64));
            initiator.put("lastName", truncate(initiatorPayload.lastName, 64));
            if (initiatorPayload.email != null && !initiatorPayload.email.isBlank()) {
                initiator.put("email", initiatorPayload.email.trim());
            }
            if (initiatorPayload.mobile != null && !initiatorPayload.mobile.isBlank()) {
                initiator.put("mobile", initiatorPayload.mobile.trim());
            }
        } else if (InitiatorPayload.TYPE_PERSON.equals(initiatorPayload.type)) {
            initiator.put("type", "PERSON");
            initiator.put("externalIdentifier", initiatorPayload.externalIdentifier);
            if (initiatorPayload.firstName != null && !initiatorPayload.firstName.isBlank()) {
                initiator.put("firstName", truncate(initiatorPayload.firstName, 64));
            }
            if (initiatorPayload.lastName != null && !initiatorPayload.lastName.isBlank()) {
                initiator.put("lastName", truncate(initiatorPayload.lastName, 64));
            }
            if (initiatorPayload.email != null && !initiatorPayload.email.isBlank()) {
                initiator.put("email", initiatorPayload.email.trim());
            }
        } else {
            initiator.put("type", "NON_PERSON");
            initiator.put("name", "justSign");
            initiator.put("externalIdentifier", normalizeIdentifier("justsign-" + safeRef(paymentRef), SIGNER_EXTERNAL_IDENTIFIER_MAX));
        }

        ObjectNode invitees = body.putObject("invitees");
        invitees.put("personalMessage", "Bitte pruefen und signieren Sie das Dokument.");
        ArrayNode signers = invitees.putArray("signers");

        for (Signatory s : signatories) {
            if (InitiatorPayload.TYPE_SIGNER.equals(initiatorPayload.type)
                && initiatorPayload.signerId != null
                && initiatorPayload.signerId.equals(s.getId())) {
                continue;
            }
            ObjectNode signer = signers.addObject();
            signer.put("type", "SIGNER");
            signer.put("externalIdentifier", signerExternalIds.getOrDefault(s.getId(), normalizeSignerIdentifier(s.getId())));
            signer.put("firstName", truncate(s.getFirstName(), 64));
            signer.put("lastName", truncate(s.getLastName(), 64));

            if (s.getEmail() != null && !s.getEmail().isBlank()) {
                signer.put("email", s.getEmail().trim());
            }
            if (s.getPhone() != null && !s.getPhone().isBlank()) {
                signer.put("mobile", s.getPhone().trim());
            }
        }

        String requestBody = body.toString();
        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create(props.getApiUrl() + "/process"))
            .header("Authorization", "Bearer " + token)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
            .build();

        HttpResponse<String> res = sendRequestWithDebug("create_process", req, requestBody);
        if (res.statusCode() != 200 && res.statusCode() != 201) {
            throw new RuntimeException("createProcess failed: HTTP " + res.statusCode() + " – " + res.body());
        }

        JsonNode json = mapper.readTree(res.body());
        String id = textAt(json, "id");
        if (id == null || id.isBlank()) {
            id = textAt(json, "processId");
        }
        if (id == null || id.isBlank()) {
            throw new RuntimeException("createProcess response did not include a process id");
        }
        return id;
    }

    private void attachDocument(String token,
                                String processId,
                                Path pdfPath,
                                String documentName,
                                List<SignatoryPlacement> placements,
                                Map<Integer, Integer> pageHeights,
                                Map<String, String> signerExternalIds)
            throws IOException, InterruptedException {

        byte[] pdfBytes = Files.readAllBytes(pdfPath);
        String fileName = (documentName == null || documentName.isBlank()) ? "document.pdf" : documentName;

        ObjectNode body = mapper.createObjectNode();
        body.put("name", fileName);
        body.put("contentType", "application/pdf");
        body.put("content", Base64.getEncoder().encodeToString(pdfBytes));
        body.put("externalIdentifier", normalizeIdentifier("file-" + fileName, SIGNER_EXTERNAL_IDENTIFIER_MAX));

        ArrayNode signaturePositions = body.putArray("signaturePositions");
        for (SignatoryPlacement p : placements == null ? List.<SignatoryPlacement>of() : placements) {
            int pageNumber = Math.max(0, p.getPage() - 1); // frontend stores pages as 1..n
            int pageHeight = pageHeights.getOrDefault(pageNumber, 0);

            // Frontend stores bottom-left origin; Swisscom expects top-left.
            int topLeftY = pageHeight > 0
                ? Math.max(0, pageHeight - (p.getY() + p.getHeight()))
                : Math.max(0, p.getY());

            ObjectNode pos = signaturePositions.addObject();
            String signerExternalId = signerExternalIds.getOrDefault(p.getSignatoryId(), normalizeSignerIdentifier(p.getSignatoryId()));
            pos.put("signer", signerExternalId);
            pos.put("pageNumber", pageNumber);
            pos.put("positionX", Math.max(0, p.getX()));
            pos.put("positionY", topLeftY);
        }

        String requestBody = body.toString();
        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create(props.getApiUrl() + "/process/" + processId + "/attach"))
            .header("Authorization", "Bearer " + token)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
            .build();

        HttpResponse<String> res = sendRequestWithDebug("attach_document processId=" + processId, req, requestBody);
        if (res.statusCode() != 200 && res.statusCode() != 201) {
            throw new RuntimeException("attachDocument failed: HTTP " + res.statusCode() + " – " + res.body());
        }
    }

    private Map<String, String> releaseProcess(String token,
                                               String processId,
                                               boolean notifyByEmail,
                                               List<Signatory> signatories,
                                               Map<String, String> signerExternalIds,
                                               InitiatorPayload initiatorPayload)
            throws IOException, InterruptedException {

        HttpRequest.Builder builder = HttpRequest.newBuilder()
            .uri(URI.create(props.getApiUrl() + "/process/" + processId + "/release"))
            .header("Authorization", "Bearer " + token)
            .header("Content-Type", "application/json");

        String requestBody = "";
        if (notifyByEmail) {
            ObjectNode notifications = buildReleaseNotifications(signatories, signerExternalIds, initiatorPayload);
            requestBody = notifications.toString();
            builder.POST(HttpRequest.BodyPublishers.ofString(requestBody));
        } else {
            builder.POST(HttpRequest.BodyPublishers.noBody());
        }

        HttpRequest req = builder.build();

        HttpResponse<String> res = sendRequestWithDebug("release_process processId=" + processId, req, requestBody);
        if (res.statusCode() != 200 && res.statusCode() != 208 && res.statusCode() != 204) {
            throw new RuntimeException("releaseProcess failed: HTTP " + res.statusCode() + " – " + res.body());
        }

        if (res.body() == null || res.body().isBlank()) {
            return Map.of();
        }

        JsonNode json = mapper.readTree(res.body());
        JsonNode participants = json.path("participants");
        if (!participants.isArray()) {
            return Map.of();
        }

        Map<String, String> urls = new HashMap<>();
        for (JsonNode participant : participants) {
            String url = textAt(participant, "url");
            if (url == null || url.isBlank()) {
                continue;
            }
            String externalIdentifier = textAt(participant, "externalIdentifier");
            if (externalIdentifier != null && !externalIdentifier.isBlank()) {
                urls.put(externalIdentifier, url);
                urls.put(normalizeSignerIdentifier(externalIdentifier), url);
            }
            String id = textAt(participant, "id");
            if (id != null && !id.isBlank()) {
                urls.put(id, url);
            }
        }
        return urls;
    }

    private ObjectNode buildReleaseNotifications(List<Signatory> signatories,
                                                 Map<String, String> signerExternalIds,
                                                 InitiatorPayload initiatorPayload) {
        ObjectNode body = mapper.createObjectNode();
        body.put("language", resolveLanguage());

        // Swisscom docs: if notifications[] is present, all participants must be listed.
        // We only add notifications[] when we can build a complete, email-capable list.
        if (!canBuildExplicitNotificationOverride(signatories, initiatorPayload)) {
            return body;
        }

        Set<String> participants = new LinkedHashSet<>();

        if (InitiatorPayload.TYPE_SIGNER.equals(initiatorPayload.type)
            || InitiatorPayload.TYPE_PERSON.equals(initiatorPayload.type)) {
            participants.add(initiatorPayload.externalIdentifier);
        }

        for (Signatory signatory : signatories) {
            participants.add(
                signerExternalIds.getOrDefault(signatory.getId(), normalizeSignerIdentifier(signatory.getId()))
            );
        }

        ArrayNode notifications = body.putArray("notifications");
        for (String participant : participants) {
            ObjectNode entry = notifications.addObject();
            entry.put("participant", participant);
            ArrayNode types = entry.putArray("notificationType");
            types.add("INVITE");
            types.add("COMPLETION");
        }

        return body;
    }

    private boolean canBuildExplicitNotificationOverride(List<Signatory> signatories, InitiatorPayload initiatorPayload) {
        if (signatories == null || signatories.isEmpty()) {
            return false;
        }
        if (initiatorPayload == null) {
            return false;
        }
        if (InitiatorPayload.TYPE_NON_PERSON.equals(initiatorPayload.type)) {
            return false;
        }
        if (initiatorPayload.email == null || initiatorPayload.email.isBlank()) {
            return false;
        }
        return signatories.stream().allMatch(s -> s.getEmail() != null && !s.getEmail().isBlank());
    }

    private String openForPerson(String token, String processId, String personId)
            throws IOException, InterruptedException {

        ObjectNode body = mapper.createObjectNode();
        body.put("language", resolveLanguage());

        String requestBody = body.toString();
        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create(props.getApiUrl() + "/process/" + processId + "/open/" + personId))
            .header("Authorization", "Bearer " + token)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
            .build();

        HttpResponse<String> res = sendRequestWithDebug("open_for_person processId=" + processId + " personId=" + personId, req, requestBody);
        if (res.statusCode() != 200 && res.statusCode() != 201) {
            throw new RuntimeException("openForPerson failed: HTTP " + res.statusCode() + " – " + res.body());
        }

        String url = textAt(mapper.readTree(res.body()), "url");
        if (url == null || url.isBlank()) {
            throw new RuntimeException("openForPerson response did not include URL");
        }
        return url;
    }

    private Map<Integer, Integer> readPageHeights(Path pdfPath) throws IOException {
        Map<Integer, Integer> pageHeights = new HashMap<>();
        try (PDDocument doc = PDDocument.load(pdfPath.toFile())) {
            for (int i = 0; i < doc.getNumberOfPages(); i++) {
                float height = doc.getPage(i).getMediaBox().getHeight();
                pageHeights.put(i, Math.round(height));
            }
        }
        return pageHeights;
    }

    private Path resolveDocumentPath(String documentRef) {
        Path direct = Path.of(documentRef);
        if (Files.exists(direct)) {
            return direct;
        }

        Path withSuffix = Path.of(uploadDir, safeRef(documentRef) + ".pdf");
        if (Files.exists(withSuffix)) {
            return withSuffix;
        }

        Path inUpload = Path.of(uploadDir, safeRef(documentRef));
        if (Files.exists(inUpload)) {
            return inUpload;
        }

        // Return the expected canonical upload path to surface the real missing-file path in errors.
        return withSuffix;
    }

    private void deleteLocalPdfQuietly(Path pdfPath, String processId, String paymentRef) {
        try {
            boolean deleted = Files.deleteIfExists(pdfPath);
            swisscomLog.info(
                "SWISSCOM_TRACE event=pdf_cleanup paymentRef={} processId={} path={} deleted={}",
                safeRef(paymentRef),
                processId,
                pdfPath,
                deleted
            );
        } catch (IOException ex) {
            swisscomLog.warn(
                "SWISSCOM_TRACE event=pdf_cleanup_failed paymentRef={} processId={} path={} reason={}",
                safeRef(paymentRef),
                processId,
                pdfPath,
                ex.getMessage()
            );
        }
    }

    private boolean shouldSendNotifications(List<Signatory> signatories, InitiatorPayload initiator) {
        if (initiator != null && initiator.email != null && !initiator.email.isBlank()) {
            return true;
        }
        if (signatories == null || signatories.isEmpty()) {
            return false;
        }
        return signatories.stream().anyMatch(s -> s.getEmail() != null && !s.getEmail().isBlank());
    }

    private String resolveLanguage() {
        if (props.getNotificationLanguage() == null || props.getNotificationLanguage().isBlank()) {
            return DEFAULT_LANGUAGE;
        }
        return props.getNotificationLanguage().trim();
    }

    private HttpResponse<String> sendRequestWithDebug(String operation,
                                                      HttpRequest request,
                                                      String requestBody)
            throws IOException, InterruptedException {
        if (swisscomSignDebugEnabled) {
            String requestEntry =
                "REQUEST op=" + operation
                    + " method=" + request.method()
                    + " uri=" + request.uri()
                    + " headers=" + request.headers().map()
                    + " body=" + requestBody;
            writeSwisscomDebugFile(requestEntry);
            swisscomLog.info("SWISSCOM_HTTP {}", requestEntry);
        }

        try {
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (swisscomSignDebugEnabled) {
                String responseEntry =
                    "RESPONSE op=" + operation
                        + " status=" + response.statusCode()
                        + " headers=" + response.headers().map()
                        + " body=" + (response.body() == null ? "" : response.body());
                writeSwisscomDebugFile(responseEntry);
                swisscomLog.info("SWISSCOM_HTTP {}", responseEntry);
            }
            return response;
        } catch (IOException | InterruptedException ex) {
            if (swisscomSignDebugEnabled) {
                String errorEntry = "ERROR op=" + operation + " reason=" + ex.getMessage();
                writeSwisscomDebugFile(errorEntry);
                swisscomLog.error("SWISSCOM_HTTP {}", errorEntry, ex);
            }
            throw ex;
        }
    }

    private void writeSwisscomDebugFile(String entry) {
        Path logPath = resolveSwisscomDebugFilePath();
        String line = Instant.now() + " " + entry + System.lineSeparator();
        synchronized (swisscomDebugFileLock) {
            try {
                Path parent = logPath.getParent();
                if (parent != null) {
                    Files.createDirectories(parent);
                }
                Files.writeString(logPath, line, StandardCharsets.UTF_8, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
            } catch (IOException ex) {
                swisscomLog.warn("SWISSCOM_TRACE event=debug_file_write_failed path={} reason={}", logPath, ex.getMessage());
            }
        }
    }

    private void ensureSwisscomDebugFileExists() {
        Path logPath = resolveSwisscomDebugFilePath();
        synchronized (swisscomDebugFileLock) {
            try {
                Path parent = logPath.getParent();
                if (parent != null) {
                    Files.createDirectories(parent);
                }
                if (!Files.exists(logPath)) {
                    Files.createFile(logPath);
                }
            } catch (IOException ex) {
                swisscomLog.warn("SWISSCOM_TRACE event=debug_file_init_failed path={} reason={}", logPath, ex.getMessage());
            }
        }
    }

    private Path resolveSwisscomDebugFilePath() {
        if (swisscomSignDebugFile != null && !swisscomSignDebugFile.isBlank()) {
            return Path.of(swisscomSignDebugFile.trim());
        }
        return Path.of(uploadDir, "swisscom-sign-debug.log");
    }

    private String resolveSwisscomProcessSignatureLevel(List<Signatory> signatories) {
        if (signatories == null || signatories.isEmpty()) {
            return "QUALIFIED";
        }
        boolean hasAdvanced = false;
        boolean hasSimple = false;
        for (Signatory signatory : signatories) {
            String level = signatory.getSignatureLevel();
            if (level == null || level.isBlank()) {
                return "QUALIFIED";
            }
            String normalized = level.trim().toUpperCase(Locale.ROOT);
            if ("SIMPLE".equals(normalized) || "SES".equals(normalized)) {
                hasSimple = true;
                continue;
            }
            if ("AES".equals(normalized) || "ADVANCED".equals(normalized) || "ADVANCED_EU".equals(normalized)) {
                hasAdvanced = true;
                continue;
            }
            if ("QES".equals(normalized) || "QUALIFIED".equals(normalized)) {
                return "QUALIFIED";
            }
        }
        if (hasAdvanced) {
            return "ADVANCED";
        }
        if (hasSimple) {
            return "SIMPLE";
        }
        return "QUALIFIED";
    }

    private String textAt(JsonNode node, String field) {
        JsonNode value = node.get(field);
        if (value == null || value.isNull()) {
            return null;
        }
        return value.asText();
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private Map<String, String> buildSignerExternalIdentifiers(List<Signatory> signatories) {
        Map<String, String> signerExternalIds = new LinkedHashMap<>();
        if (signatories == null) {
            return signerExternalIds;
        }
        for (Signatory signatory : signatories) {
            String signatoryId = signatory.getId();
            signerExternalIds.put(signatoryId, normalizeSignerIdentifier(signatoryId));
        }
        return signerExternalIds;
    }

    private InitiatorPayload resolveInitiator(InitiatorSelection initiatorSelection,
                                              List<Signatory> signatories,
                                              Map<String, String> signerExternalIds,
                                              String paymentRef) {
        if (initiatorSelection != null && InitiatorSelection.MODE_SIGNER.equalsIgnoreCase(initiatorSelection.getMode())) {
            String selectedSignerId = initiatorSelection.getSignerId();
            if (selectedSignerId != null && !selectedSignerId.isBlank()) {
                Signatory signer = signatories == null ? null : signatories.stream()
                    .filter(s -> selectedSignerId.equals(s.getId()))
                    .findFirst()
                    .orElse(null);
                if (signer != null) {
                    return InitiatorPayload.signer(
                        signer.getId(),
                        signerExternalIds.getOrDefault(signer.getId(), normalizeSignerIdentifier(signer.getId())),
                        signer.getFirstName(),
                        signer.getLastName(),
                        signer.getEmail(),
                        signer.getPhone()
                    );
                }
            }
        }

        if (initiatorSelection != null && InitiatorSelection.MODE_THIRD_PERSON.equalsIgnoreCase(initiatorSelection.getMode())) {
            if (initiatorSelection.getEmail() != null && !initiatorSelection.getEmail().isBlank()) {
                return InitiatorPayload.person(
                    normalizeIdentifier("init-" + safeRef(paymentRef), SIGNER_EXTERNAL_IDENTIFIER_MAX),
                    initiatorSelection.getFirstName(),
                    initiatorSelection.getLastName(),
                    initiatorSelection.getEmail()
                );
            }
        }

        return InitiatorPayload.nonPerson(
            normalizeIdentifier("justsign-" + safeRef(paymentRef), SIGNER_EXTERNAL_IDENTIFIER_MAX)
        );
    }

    private String normalizeSignerIdentifier(String value) {
        return normalizeIdentifier(value, SIGNER_EXTERNAL_IDENTIFIER_MAX);
    }

    private String normalizeIdentifier(String value, int maxLen) {
        String safe = safeRef(value).replaceAll("[^a-zA-Z0-9._~-]", "_");
        if (safe.length() <= maxLen) {
            return safe;
        }
        String hash = shortHash(safe);
        int prefixLen = Math.max(1, maxLen - hash.length() - 1);
        return safe.substring(0, prefixLen) + "-" + hash;
    }

    private String shortHash(String value) {
        CRC32 crc = new CRC32();
        crc.update(value.getBytes(StandardCharsets.UTF_8));
        return Long.toHexString(crc.getValue());
    }

    private String safeRef(String value) {
        if (value == null || value.isBlank()) {
            return "ref";
        }
        return value.trim();
    }

    private String truncate(String value, int maxLen) {
        if (value == null) {
            return "";
        }
        if (value.length() <= maxLen) {
            return value;
        }
        return value.substring(0, maxLen);
    }

    private static final class InitiatorPayload {
        private static final String TYPE_NON_PERSON = "NON_PERSON";
        private static final String TYPE_PERSON = "PERSON";
        private static final String TYPE_SIGNER = "SIGNER";

        private final String type;
        private final String signerId;
        private final String externalIdentifier;
        private final String firstName;
        private final String lastName;
        private final String email;
        private final String mobile;

        private InitiatorPayload(String type,
                                 String signerId,
                                 String externalIdentifier,
                                 String firstName,
                                 String lastName,
                                 String email,
                                 String mobile) {
            this.type = type;
            this.signerId = signerId;
            this.externalIdentifier = externalIdentifier;
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.mobile = mobile;
        }

        private static InitiatorPayload nonPerson(String externalIdentifier) {
            return new InitiatorPayload(TYPE_NON_PERSON, null, externalIdentifier, null, null, null, null);
        }

        private static InitiatorPayload person(String externalIdentifier, String firstName, String lastName, String email) {
            return new InitiatorPayload(TYPE_PERSON, null, externalIdentifier, firstName, lastName, email, null);
        }

        private static InitiatorPayload signer(String signerId,
                                               String externalIdentifier,
                                               String firstName,
                                               String lastName,
                                               String email,
                                               String mobile) {
            return new InitiatorPayload(TYPE_SIGNER, signerId, externalIdentifier, firstName, lastName, email, mobile);
        }
    }

}
