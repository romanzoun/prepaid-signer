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
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ContractAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(ContractAnalysisService.class);
    private static final Pattern ISO_DATE_PATTERN = Pattern.compile("\\b\\d{4}-\\d{2}-\\d{2}\\b");
    private static final Pattern DOTTED_DATE_PATTERN = Pattern.compile("\\b\\d{1,2}\\.\\d{1,2}\\.\\d{2,4}\\b");

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

    @Value("${app.contract-analysis.max-input-chars:120000}")
    private int maxInputChars;

    public Map<String, Object> analyze(MultipartFile file, ContractAnalyzeOptions options) {
        validateFile(file);
        ensureOpenAiConfigured();
        try {
            String fileName = file.getOriginalFilename() == null ? "document.pdf" : file.getOriginalFilename();
            byte[] pdfBytes = file.getBytes();
            return analyzePdf(fileName, pdfBytes, options);
        } catch (IOException ex) {
            throw new IllegalArgumentException("Could not read PDF bytes: " + ex.getMessage());
        }
    }

    public Map<String, Object> analyzeStoredDocument(Path pdfPath, String fileName, ContractAnalyzeOptions options) {
        ensureOpenAiConfigured();
        try {
            if (pdfPath == null || !Files.exists(pdfPath)) {
                throw new IllegalArgumentException("Uploaded PDF not found");
            }
            String safeName = (fileName == null || fileName.isBlank()) ? "document.pdf" : fileName;
            byte[] pdfBytes = Files.readAllBytes(pdfPath);
            return analyzePdf(safeName, pdfBytes, options);
        } catch (IOException ex) {
            throw new IllegalArgumentException("Could not read uploaded PDF: " + ex.getMessage());
        }
    }

    private Map<String, Object> analyzePdf(String fileName, byte[] pdfBytes, ContractAnalyzeOptions options) {
        String docId = UUID.randomUUID().toString();
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
        docMeta.put("confidence_mode", normalize(options.confidenceMode(), "consensus7"));

        Map<String, Object> preExtractHints = buildPreExtractHints(chunks);

        JsonNode run1 = runPrompt("run1_doc_map", Map.of(
            "doc_meta", docMeta,
            "chunks", trimChunks(chunks),
            "preextract_hints", preExtractHints
        ));

        List<Map<String, Object>> terminationChunks = focusChunks(chunks, Set.of("terminate", "termination", "notice", "renew", "kuendig", "duree", "resiliation"));
        List<Map<String, Object>> obligationsChunks = focusChunks(chunks, Set.of("obligation", "service", "sla", "support", "deadline", "liefer", "pflicht"));
        List<Map<String, Object>> commercialsChunks = focusChunks(chunks, Set.of("price", "payment", "fee", "invoice", "tax", "vat", "chf", "eur"));
        List<Map<String, Object>> liabilityChunks = focusChunks(chunks, Set.of("liability", "indemn", "warranty", "damages", "haftung", "garantie"));
        List<Map<String, Object>> privacyChunks = focusChunks(chunks, Set.of("privacy", "data", "gdpr", "dsg", "ndsg", "security", "confidential"));
        List<Map<String, Object>> miscChunks = focusChunks(chunks, Set.of("assignment", "subcontract", "dispute", "governing law", "ip", "license", "notice"));

        JsonNode run2 = runPrompt("run2_termination", Map.of(
            "doc_meta", docMeta,
            "focus_chunks", trimChunks(terminationChunks),
            "run1_section_map", run1.path("section_map")
        ));
        JsonNode run3 = runPrompt("run3_obligations_sla", Map.of(
            "doc_meta", docMeta,
            "focus_chunks", trimChunks(obligationsChunks),
            "run1_section_map", run1.path("section_map")
        ));
        JsonNode run4 = runPrompt("run4_commercials", Map.of(
            "doc_meta", docMeta,
            "focus_chunks", trimChunks(commercialsChunks),
            "run1_section_map", run1.path("section_map")
        ));
        JsonNode run5 = runPrompt("run5_liability", Map.of(
            "doc_meta", docMeta,
            "focus_chunks", trimChunks(liabilityChunks),
            "run1_section_map", run1.path("section_map")
        ));
        JsonNode run6 = runPrompt("run6_privacy_security", Map.of(
            "doc_meta", docMeta,
            "focus_chunks", trimChunks(privacyChunks),
            "run1_section_map", run1.path("section_map")
        ));
        JsonNode run7 = runPrompt("run7_misc", Map.of(
            "doc_meta", docMeta,
            "focus_chunks", trimChunks(miscChunks),
            "run1_section_map", run1.path("section_map")
        ));

        List<JsonNode> runOutputs = List.of(run1, run2, run3, run4, run5, run6, run7);

        JsonNode consensus = runPrompt("consensus_judge", Map.of(
            "doc_meta", docMeta,
            "run_outputs", runOutputs
        ));

        JsonNode confidence = runPrompt("confidence_scorer", Map.of(
            "consensus_output", consensus
        ));

        JsonNode finalSummary = runPrompt("final_synthesizer", Map.of(
            "doc_meta", docMeta,
            "consensus_output", consensus,
            "confidence_output", confidence
        ));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("doc_id", docId);
        response.put("summary", finalSummary.path("executive_summary").asText(""));
        response.put("key_dates", toJava(finalSummary.path("key_dates")));
        response.put("termination", toJava(consensus.path("canonical").path("termination")));
        response.put("obligations", toJava(finalSummary.path("top_obligations")));
        response.put("risks", toJava(finalSummary.path("top_risks")));
        response.put("opportunities", toJava(finalSummary.path("top_opportunities")));
        response.put("open_questions", toJava(finalSummary.path("open_questions")));
        response.put("evidence", toJava(consensus.path("critical_claims")));
        response.put("consensus", toJava(consensus.path("agreement_metrics")));
        response.put("confidence", toJava(confidence));
        response.put("final_report", toJava(finalSummary));
        response.put("generated_at", Instant.now().toString());

        return response;
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

    private List<Map<String, Object>> focusChunks(List<Map<String, Object>> chunks, Set<String> keywords) {
        List<Map<String, Object>> selected = new ArrayList<>();
        int charBudget = Math.max(20000, maxInputChars / 6);
        int used = 0;

        for (Map<String, Object> chunk : chunks) {
            String text = String.valueOf(chunk.get("text")).toLowerCase(Locale.ROOT);
            boolean match = keywords.stream().anyMatch(text::contains);
            if (!match) {
                continue;
            }
            int len = text.length();
            if (used + len > charBudget) {
                break;
            }
            selected.add(chunk);
            used += len;
        }

        if (selected.isEmpty()) {
            return chunks;
        }
        return selected;
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
        try {
            String systemPrompt = loadPrompt("prompts/contracts/_system.md");
            String promptTemplate = loadPrompt("prompts/contracts/" + promptName + ".md");
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

    private String loadPrompt(String path) throws IOException {
        ClassPathResource resource = new ClassPathResource(path);
        return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
    }

    private Object toJava(JsonNode node) {
        return mapper.convertValue(node, Object.class);
    }
}
