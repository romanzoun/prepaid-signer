package com.swisssigner.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.swisssigner.model.ContractAnalyzeOptions;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ContractAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(ContractAnalysisService.class);
    private static final Pattern ISO_DATE_PATTERN = Pattern.compile("\\b\\d{4}-\\d{2}-\\d{2}\\b");
    private static final Pattern DOTTED_DATE_PATTERN = Pattern.compile("\\b\\d{1,2}\\.\\d{1,2}\\.\\d{2,4}\\b");
    private static final Pattern FIRST_INTEGER_PATTERN = Pattern.compile("-?\\d+");
    public static final int TOTAL_ANALYSIS_STEPS = 3;

    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(20))
        .build();

    @Value("${app.contract-analysis.openai-api-key:${OPENAI_API_KEY:}}")
    private String openAiApiKey;

    @Value("${app.contract-analysis.openai-model:${OPENAI_MODEL:gpt-4.1-mini}}")
    private String openAiModel;

    @Value("${app.contract-analysis.openai-base-url:${OPENAI_BASE_URL:https://api.openai.com/v1}}")
    private String openAiBaseUrl;

    @Value("${app.contract-analysis.timeout-seconds:120}")
    private int timeoutSeconds;

    @Value("${app.contract-analysis.max-input-chars:40000}")
    private int maxInputChars;

    public Map<String, Object> analyze(MultipartFile file, ContractAnalyzeOptions options) {
        return analyze(file, options, ProgressListener.NO_OP);
    }

    public Map<String, Object> analyze(MultipartFile file,
                                       ContractAnalyzeOptions options,
                                       ProgressListener progressListener) {
        validateFile(file);
        ensureOpenAiConfigured();
        try {
            String fileName = file.getOriginalFilename() == null ? "document.pdf" : file.getOriginalFilename();
            byte[] pdfBytes = file.getBytes();
            return analyzePdf(fileName, pdfBytes, options, progressListener == null ? ProgressListener.NO_OP : progressListener);
        } catch (IOException ex) {
            throw new IllegalArgumentException("Could not read PDF bytes: " + ex.getMessage());
        }
    }

    public Map<String, Object> analyzeStoredDocument(Path pdfPath, String fileName, ContractAnalyzeOptions options) {
        return analyzeStoredDocument(pdfPath, fileName, options, ProgressListener.NO_OP);
    }

    public Map<String, Object> analyzeStoredDocument(Path pdfPath,
                                                     String fileName,
                                                     ContractAnalyzeOptions options,
                                                     ProgressListener progressListener) {
        ensureOpenAiConfigured();
        try {
            if (pdfPath == null || !Files.exists(pdfPath)) {
                throw new IllegalArgumentException("Uploaded PDF not found");
            }
            String safeName = (fileName == null || fileName.isBlank()) ? "document.pdf" : fileName;
            byte[] pdfBytes = Files.readAllBytes(pdfPath);
            return analyzePdf(safeName, pdfBytes, options, progressListener == null ? ProgressListener.NO_OP : progressListener);
        } catch (IOException ex) {
            throw new IllegalArgumentException("Could not read uploaded PDF: " + ex.getMessage());
        }
    }

    private Map<String, Object> analyzePdf(String fileName,
                                           byte[] pdfBytes,
                                           ContractAnalyzeOptions options,
                                           ProgressListener progressListener) {
        String docId = UUID.randomUUID().toString();
        progressListener.onProgress(1, TOTAL_ANALYSIS_STEPS, "PREPARE_INPUT");
        List<Map<String, Object>> chunks = extractChunks(pdfBytes);
        if (chunks.isEmpty()) {
            throw new IllegalArgumentException("Could not extract text from PDF");
        }

        Map<String, Object> docMeta = new LinkedHashMap<>();
        docMeta.put("doc_id", docId);
        docMeta.put("file_name", fileName);
        docMeta.put("language", normalize(options.language(), "auto"));
        docMeta.put("jurisdiction_hint", normalize(options.jurisdictionHint(), null));
        docMeta.put("party_role", normalize(options.partyRole(), null));
        docMeta.put("analysis_profile", normalize(options.analysisProfile(), "standard"));

        Map<String, Object> preExtractHints = buildPreExtractHints(chunks);
        List<Map<String, Object>> trimmedChunks = trimChunks(chunks);

        String outputLanguage = resolveOutputLanguage(options.language());

        progressListener.onProgress(2, TOTAL_ANALYSIS_STEPS, "AI_ANALYSIS");
        JsonNode result = runPrompt("single_analysis", Map.of(
            "doc_meta", docMeta,
            "chunks", trimmedChunks,
            "preextract_hints", preExtractHints
        ), outputLanguage);

        String summary = result.path("summary").asText("");
        if (summary.isBlank()) {
            summary = result.path("final_report").path("executive_summary").asText("");
        }

        JsonNode rawConfidenceNode = result.path("confidence");
        if (rawConfidenceNode.isMissingNode() || rawConfidenceNode.isNull()) {
            ObjectNode fallbackConfidence = mapper.createObjectNode();
            fallbackConfidence.put("score", 0);
            fallbackConfidence.put("overall_score", 0);
            fallbackConfidence.put("explanation", "No confidence score returned.");
            rawConfidenceNode = fallbackConfidence;
        }
        ObjectNode confidenceNode = normalizeConfidenceNode(rawConfidenceNode);

        JsonNode finalReportNode = result.path("final_report");
        if (finalReportNode.isMissingNode() || finalReportNode.isNull() || !finalReportNode.isObject()) {
            finalReportNode = buildFinalReportFallback(summary, result, confidenceNode);
        } else {
            normalizeFinalReportConfidence((ObjectNode) finalReportNode, confidenceNode);
        }

        progressListener.onProgress(3, TOTAL_ANALYSIS_STEPS, "BUILD_RESULT");
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("doc_id", docId);
        response.put("summary", summary);
        response.put("key_dates", toJava(arrayOrEmpty(result.path("key_dates"))));
        response.put("termination", toJava(objectOrEmpty(result.path("termination"))));
        response.put("obligations", toJava(arrayOrEmpty(result.path("obligations"))));
        response.put("risks", toJava(arrayOrEmpty(result.path("risks"))));
        response.put("opportunities", toJava(arrayOrEmpty(result.path("opportunities"))));
        response.put("open_questions", toJava(arrayOrEmpty(result.path("open_questions"))));
        response.put("evidence", toJava(arrayOrEmpty(result.path("evidence"))));
        response.put("consensus", mapper.createObjectNode());
        response.put("confidence", toJava(confidenceNode));
        response.put("final_report", toJava(finalReportNode));
        response.put("generated_at", Instant.now().toString());

        return response;
    }

    public interface ProgressListener {
        ProgressListener NO_OP = (step, totalSteps, stepKey) -> { };
        void onProgress(int step, int totalSteps, String stepKey);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No file provided");
        }
        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase(Locale.ROOT);
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        boolean pdfByName = filename.endsWith(".pdf");
        boolean pdfByMime = contentType.contains("pdf") || contentType.equals("application/octet-stream");
        if (!pdfByName && !pdfByMime) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }
    }

    private void ensureOpenAiConfigured() {
        if (openAiApiKey == null || openAiApiKey.isBlank()) {
            throw new IllegalStateException("Contract analysis is not configured. Set OPENAI_API_KEY.");
        }
    }

    private String normalize(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value.trim();
    }

    private List<Map<String, Object>> extractChunks(byte[] pdfBytes) {
        List<Map<String, Object>> chunks = new ArrayList<>();
        try (PDDocument doc = PDDocument.load(pdfBytes)) {
            int pages = doc.getNumberOfPages();
            PDFTextStripper stripper = new PDFTextStripper();
            for (int page = 1; page <= pages; page++) {
                stripper.setStartPage(page);
                stripper.setEndPage(page);
                String pageText = normalizeText(stripper.getText(doc));
                if (pageText.isBlank()) {
                    continue;
                }
                List<String> pageChunks = splitBySize(pageText, 2200);
                for (int i = 0; i < pageChunks.size(); i++) {
                    Map<String, Object> chunk = new LinkedHashMap<>();
                    chunk.put("chunk_id", "p" + page + "c" + (i + 1));
                    chunk.put("page_start", page);
                    chunk.put("page_end", page);
                    chunk.put("text", pageChunks.get(i));
                    chunks.add(chunk);
                }
            }
        } catch (IOException ex) {
            throw new IllegalArgumentException("Could not parse PDF: " + ex.getMessage());
        }
        return chunks;
    }

    private String normalizeText(String text) {
        if (text == null) {
            return "";
        }
        return text
            .replace("\u00A0", " ")
            .replaceAll("[\\t\\x0B\\f\\r]+", " ")
            .replaceAll(" +", " ")
            .replaceAll("\\n{3,}", "\n\n")
            .trim();
    }

    private List<String> splitBySize(String text, int maxChars) {
        if (text.length() <= maxChars) {
            return List.of(text);
        }
        List<String> out = new ArrayList<>();
        int start = 0;
        while (start < text.length()) {
            int end = Math.min(text.length(), start + maxChars);
            if (end < text.length()) {
                int candidate = text.lastIndexOf("\n", end);
                if (candidate > start + 400) {
                    end = candidate;
                }
            }
            out.add(text.substring(start, end).trim());
            start = end;
        }
        return out;
    }

    private Map<String, Object> buildPreExtractHints(List<Map<String, Object>> chunks) {
        List<String> dates = new ArrayList<>();
        List<String> headings = new ArrayList<>();

        for (Map<String, Object> chunk : chunks) {
            String text = String.valueOf(chunk.get("text"));
            Matcher iso = ISO_DATE_PATTERN.matcher(text);
            while (iso.find() && dates.size() < 30) {
                dates.add(iso.group());
            }
            Matcher dotted = DOTTED_DATE_PATTERN.matcher(text);
            while (dotted.find() && dates.size() < 30) {
                dates.add(dotted.group());
            }

            String[] lines = text.split("\\n");
            for (String line : lines) {
                String clean = line.trim();
                if (clean.length() >= 8 && clean.length() <= 90 && Character.isUpperCase(clean.charAt(0)) && !clean.endsWith(".")) {
                    headings.add(clean);
                    if (headings.size() >= 20) {
                        break;
                    }
                }
            }
        }

        Map<String, Object> hints = new LinkedHashMap<>();
        hints.put("dates_found", dates);
        hints.put("headings", headings);
        hints.put("parties_found", List.of());
        hints.put("amounts_found", List.of());
        return hints;
    }

    private List<Map<String, Object>> trimChunks(List<Map<String, Object>> chunks) {
        List<Map<String, Object>> out = new ArrayList<>();
        int used = 0;
        for (Map<String, Object> chunk : chunks) {
            String text = String.valueOf(chunk.get("text"));
            if (used + text.length() > maxInputChars) {
                break;
            }
            out.add(chunk);
            used += text.length();
        }
        return out.isEmpty() ? chunks.subList(0, Math.min(chunks.size(), 1)) : out;
    }

    private JsonNode runPrompt(String promptName, Map<String, Object> inputPayload) {
        return runPrompt(promptName, inputPayload, null);
    }

    private JsonNode runPrompt(String promptName, Map<String, Object> inputPayload, String outputLanguage) {
        try {
            String systemPrompt = loadPrompt("prompts/contracts/_system.md");
            String promptTemplate = loadPrompt("prompts/contracts/" + promptName + ".md");
            if (outputLanguage != null) {
                promptTemplate = promptTemplate.replace("{{OUTPUT_LANGUAGE}}", outputLanguage);
            }
            String inputJson = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(inputPayload);
            String userPrompt = promptTemplate + "\n\nInput JSON:\n" + inputJson;

            String rawJson = callOpenAi(systemPrompt, userPrompt);
            JsonNode parsed = parseAsJson(rawJson);
            log.info("contract_analysis prompt={} ok", promptName);
            return parsed;
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Contract analysis failed at " + promptName + ": " + ex.getMessage(), ex);
        } catch (IOException ex) {
            throw new RuntimeException("Contract analysis failed at " + promptName + ": " + ex.getMessage(), ex);
        }
    }

    private String callOpenAi(String systemPrompt, String userPrompt) throws IOException, InterruptedException {
        String base = openAiBaseUrl.endsWith("/") ? openAiBaseUrl.substring(0, openAiBaseUrl.length() - 1) : openAiBaseUrl;
        ObjectNode req = mapper.createObjectNode();
        req.put("model", openAiModel);
        req.put("temperature", 0.1);

        ObjectNode responseFormat = req.putObject("response_format");
        responseFormat.put("type", "json_object");

        ArrayNode messages = req.putArray("messages");
        ObjectNode system = messages.addObject();
        system.put("role", "system");
        system.put("content", systemPrompt);

        ObjectNode user = messages.addObject();
        user.put("role", "user");
        user.put("content", userPrompt);

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(base + "/chat/completions"))
            .header("Authorization", "Bearer " + openAiApiKey)
            .header("Content-Type", "application/json")
            .timeout(Duration.ofSeconds(timeoutSeconds))
            .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(req), StandardCharsets.UTF_8))
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new RuntimeException("OpenAI call failed: HTTP " + response.statusCode() + " - " + response.body());
        }

        JsonNode body = mapper.readTree(response.body());
        JsonNode contentNode = body.path("choices").path(0).path("message").path("content");
        if (contentNode.isMissingNode() || contentNode.asText().isBlank()) {
            throw new RuntimeException("OpenAI response did not contain content");
        }
        return contentNode.asText();
    }

    private JsonNode parseAsJson(String raw) {
        try {
            return mapper.readTree(raw);
        } catch (IOException first) {
            int start = raw.indexOf('{');
            int end = raw.lastIndexOf('}');
            if (start >= 0 && end > start) {
                String candidate = raw.substring(start, end + 1);
                try {
                    return mapper.readTree(candidate);
                } catch (IOException second) {
                    throw new RuntimeException("Model output was not valid JSON", second);
                }
            }
            throw new RuntimeException("Model output was not valid JSON", first);
        }
    }

    private JsonNode arrayOrEmpty(JsonNode node) {
        return node != null && node.isArray() ? node : mapper.createArrayNode();
    }

    private JsonNode objectOrEmpty(JsonNode node) {
        return node != null && node.isObject() ? node : mapper.createObjectNode();
    }

    private JsonNode buildFinalReportFallback(String summary, JsonNode semanticConsensus, JsonNode confidenceNode) {
        ObjectNode out = mapper.createObjectNode();
        out.put("executive_summary", summary == null ? "" : summary);
        out.set("key_dates", arrayOrEmpty(semanticConsensus.path("key_dates")));
        out.set("top_obligations", arrayOrEmpty(semanticConsensus.path("obligations")));
        out.set("top_risks", arrayOrEmpty(semanticConsensus.path("risks")));
        out.set("top_opportunities", arrayOrEmpty(semanticConsensus.path("opportunities")));
        out.set("open_questions", arrayOrEmpty(semanticConsensus.path("open_questions")));
        out.set("confidence", objectOrEmpty(confidenceNode));
        return out;
    }

    private ObjectNode normalizeConfidenceNode(JsonNode rawConfidenceNode) {
        ObjectNode out = rawConfidenceNode != null && rawConfidenceNode.isObject()
            ? ((ObjectNode) rawConfidenceNode).deepCopy()
            : mapper.createObjectNode();

        Integer rawScore = readIntegerField(rawConfidenceNode, "score");
        Integer rawOverall = readIntegerField(rawConfidenceNode, "overall_score");

        int score = clampConfidenceScore(rawScore == null ? (rawOverall == null ? 0 : rawOverall) : rawScore);
        int overall = clampConfidenceScore(rawOverall == null ? score : rawOverall);

        out.put("score", score);
        out.put("overall_score", overall);
        return out;
    }

    private void normalizeFinalReportConfidence(ObjectNode finalReportNode, ObjectNode normalizedConfidence) {
        JsonNode existing = finalReportNode.path("confidence");
        ObjectNode reportConfidence = existing.isObject()
            ? ((ObjectNode) existing).deepCopy()
            : mapper.createObjectNode();

        Integer reportScore = readIntegerField(existing, "score");
        Integer reportOverall = readIntegerField(existing, "overall_score");
        int fallbackScore = normalizedConfidence.path("score").asInt(0);
        int fallbackOverall = normalizedConfidence.path("overall_score").asInt(0);

        reportConfidence.put("score", clampConfidenceScore(reportScore == null ? fallbackScore : reportScore));
        reportConfidence.put("overall_score", clampConfidenceScore(reportOverall == null ? fallbackOverall : reportOverall));

        if ((!reportConfidence.has("explanation") || reportConfidence.path("explanation").asText("").isBlank())
            && normalizedConfidence.has("explanation")) {
            reportConfidence.put("explanation", normalizedConfidence.path("explanation").asText(""));
        }

        finalReportNode.set("confidence", reportConfidence);
    }

    private Integer readIntegerField(JsonNode node, String field) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }
        JsonNode candidate = node.path(field);
        if (!candidate.isMissingNode() && !candidate.isNull()) {
            if (candidate.isNumber()) {
                return candidate.asInt();
            }
            if (candidate.isTextual()) {
                Matcher matcher = FIRST_INTEGER_PATTERN.matcher(candidate.asText(""));
                if (matcher.find()) {
                    try {
                        return Integer.parseInt(matcher.group());
                    } catch (NumberFormatException ignored) {
                        return null;
                    }
                }
            }
        }
        if (node.isNumber()) {
            return node.asInt();
        }
        if (node.isTextual()) {
            Matcher matcher = FIRST_INTEGER_PATTERN.matcher(node.asText(""));
            if (matcher.find()) {
                try {
                    return Integer.parseInt(matcher.group());
                } catch (NumberFormatException ignored) {
                    return null;
                }
            }
        }
        return null;
    }

    private int clampConfidenceScore(int value) {
        if (value < 0) {
            return 0;
        }
        return Math.min(value, 99);
    }

    private String resolveOutputLanguage(String language) {
        if (language == null || language.isBlank() || "auto".equalsIgnoreCase(language)) {
            return "the same language as the document";
        }
        return switch (language.toLowerCase(Locale.ROOT)) {
            case "de" -> "German (Deutsch)";
            case "en" -> "English";
            case "fr" -> "French (Francais)";
            case "it" -> "Italian (Italiano)";
            default -> language;
        };
    }

    private String loadPrompt(String path) throws IOException {
        ClassPathResource resource = new ClassPathResource(path);
        return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
    }

    private Object toJava(JsonNode node) {
        return mapper.convertValue(node, Object.class);
    }
}
