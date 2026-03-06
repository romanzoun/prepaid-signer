package com.swisssigner.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.swisssigner.model.Signatory;
import com.swisssigner.model.SignatoryPlacement;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
public class SignaturePlacementService {

    private static final Logger log = LoggerFactory.getLogger(SignaturePlacementService.class);
    private static final int BOX_W = 150;
    private static final int BOX_H = 45;
    private static final int RENDER_DPI = 150;
    private static final int MAX_PAGES_TO_SEND = 4;

    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(20))
            .build();

    @Value("${app.contract-analysis.openai-api-key:${OPENAI_API_KEY:}}")
    private String openAiApiKey;

    @Value("${app.placement-analysis.openai-model:${OPENAI_PLACEMENT_MODEL:gpt-5}}")
    private String placementModel;

    @Value("${app.contract-analysis.openai-base-url:${OPENAI_BASE_URL:https://api.openai.com/v1}}")
    private String openAiBaseUrl;

    @Value("${app.placement-analysis.timeout-seconds:60}")
    private int timeoutSeconds;

    /**
     * Analyze the PDF and suggest placement coordinates for each signatory.
     * Sends page images to a vision-capable GPT model and parses the response.
     */
    public List<SignatoryPlacement> suggestPlacements(Path pdfPath, List<Signatory> signatories) {
        if (openAiApiKey == null || openAiApiKey.isBlank()) {
            log.warn("placement_suggest: no OpenAI API key, using fallback");
            return fallbackPlacements(pdfPath, signatories);
        }

        try (PDDocument doc = PDDocument.load(pdfPath.toFile())) {
            int pageCount = doc.getNumberOfPages();
            PDFRenderer renderer = new PDFRenderer(doc);

            // Determine which pages to send (last pages are most likely to have signature areas)
            List<Integer> pagesToSend = selectPages(pageCount);

            // Collect page dimensions
            List<PageInfo> pageInfos = new ArrayList<>();
            for (int i = 0; i < pageCount; i++) {
                PDPage page = doc.getPage(i);
                PDRectangle box = page.getMediaBox();
                pageInfos.add(new PageInfo(i + 1, box.getWidth(), box.getHeight()));
            }

            // Render selected pages to base64 PNG
            List<PageImage> pageImages = new ArrayList<>();
            for (int pageIndex : pagesToSend) {
                BufferedImage image = renderer.renderImageWithDPI(pageIndex, RENDER_DPI);
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(image, "png", baos);
                String base64 = Base64.getEncoder().encodeToString(baos.toByteArray());
                pageImages.add(new PageImage(pageIndex + 1, base64));
            }

            // Build prompt
            String systemPrompt = loadPrompt("prompts/placements/_system.md");
            String promptTemplate = loadPrompt("prompts/placements/suggest_placements.md");

            StringBuilder signatoryList = new StringBuilder();
            for (Signatory s : signatories) {
                signatoryList.append("- ID: ").append(s.getId())
                        .append(", Name: ").append(s.getFirstName()).append(" ").append(s.getLastName())
                        .append("\n");
            }

            String prompt = promptTemplate
                    .replace("{{PAGE_COUNT}}", String.valueOf(pageCount))
                    .replace("{{SIGNATORIES}}", signatoryList.toString());

            // Add page dimensions info
            StringBuilder dimInfo = new StringBuilder("\n\nPage dimensions (in PDF points):\n");
            for (PageInfo pi : pageInfos) {
                dimInfo.append("- Page ").append(pi.pageNum).append(": ")
                        .append(String.format("%.0f", pi.width)).append(" x ")
                        .append(String.format("%.0f", pi.height)).append(" pt\n");
            }
            prompt += dimInfo.toString();

            // Call OpenAI with vision
            String responseJson = callOpenAiVision(systemPrompt, prompt, pageImages);
            JsonNode parsed = parseAsJson(responseJson);
            JsonNode placementsNode = parsed.path("placements");

            if (!placementsNode.isArray() || placementsNode.isEmpty()) {
                log.warn("placement_suggest: AI returned no placements, using fallback");
                return fallbackPlacements(pdfPath, signatories);
            }

            List<SignatoryPlacement> result = new ArrayList<>();
            for (JsonNode node : placementsNode) {
                String signatoryId = node.path("signatoryId").asText("");
                int page = node.path("page").asInt(pageCount);
                int x = node.path("x").asInt(72);
                int y = node.path("y").asInt(100);
                int width = node.path("width").asInt(BOX_W);
                int height = node.path("height").asInt(BOX_H);

                // Clamp to page bounds
                if (page < 1) page = 1;
                if (page > pageCount) page = pageCount;
                PageInfo pi = pageInfos.get(page - 1);
                x = Math.max(0, Math.min(x, (int) pi.width - width));
                y = Math.max(0, Math.min(y, (int) pi.height - height));

                result.add(new SignatoryPlacement(signatoryId, page, x, y, width, height));
            }

            // Ensure all signatories have a placement
            for (Signatory s : signatories) {
                boolean found = result.stream().anyMatch(p -> s.getId().equals(p.getSignatoryId()));
                if (!found) {
                    log.warn("placement_suggest: AI missed signatory {}, adding fallback", s.getId());
                    PageInfo lastPage = pageInfos.get(pageCount - 1);
                    int idx = signatories.indexOf(s);
                    int fx = 72 + idx * (BOX_W + 20);
                    if (fx + BOX_W > lastPage.width) fx = (int) lastPage.width - BOX_W - 10;
                    result.add(new SignatoryPlacement(s.getId(), pageCount, Math.max(0, fx), 72, BOX_W, BOX_H));
                }
            }

            log.info("placement_suggest: AI suggested {} placements", result.size());
            return result;

        } catch (Exception e) {
            log.error("placement_suggest: AI failed, using fallback: {}", e.getMessage());
            return fallbackPlacements(pdfPath, signatories);
        }
    }

    /**
     * Fallback: place signatures at the bottom of the last page, spaced horizontally.
     */
    private List<SignatoryPlacement> fallbackPlacements(Path pdfPath, List<Signatory> signatories) {
        float pageWidth = 595; // A4 default
        float pageHeight = 842;
        int pageCount = 1;

        try (PDDocument doc = PDDocument.load(pdfPath.toFile())) {
            pageCount = doc.getNumberOfPages();
            PDPage lastPage = doc.getPage(pageCount - 1);
            PDRectangle box = lastPage.getMediaBox();
            pageWidth = box.getWidth();
            pageHeight = box.getHeight();
        } catch (IOException e) {
            log.warn("placement_fallback: could not read PDF for dimensions: {}", e.getMessage());
        }

        List<SignatoryPlacement> result = new ArrayList<>();
        int count = signatories.size();
        float availableWidth = pageWidth - 72 * 2; // 72pt margin on each side
        float spacing = count > 1 ? Math.min((availableWidth - count * BOX_W) / (count - 1), 30) : 0;
        float totalWidth = count * BOX_W + (count - 1) * spacing;
        float startX = (pageWidth - totalWidth) / 2;

        for (int i = 0; i < count; i++) {
            int x = (int) (startX + i * (BOX_W + spacing));
            x = Math.max(0, Math.min(x, (int) pageWidth - BOX_W));
            result.add(new SignatoryPlacement(signatories.get(i).getId(), pageCount, x, 72, BOX_W, BOX_H));
        }
        return result;
    }

    private List<Integer> selectPages(int pageCount) {
        List<Integer> pages = new ArrayList<>();
        if (pageCount <= MAX_PAGES_TO_SEND) {
            for (int i = 0; i < pageCount; i++) pages.add(i);
        } else {
            // Always include first page and last pages
            pages.add(0);
            for (int i = Math.max(1, pageCount - (MAX_PAGES_TO_SEND - 1)); i < pageCount; i++) {
                pages.add(i);
            }
        }
        return pages;
    }

    private String callOpenAiVision(String systemPrompt, String userPrompt, List<PageImage> images)
            throws IOException, InterruptedException {
        String base = openAiBaseUrl.endsWith("/") ? openAiBaseUrl.substring(0, openAiBaseUrl.length() - 1) : openAiBaseUrl;

        ObjectNode req = mapper.createObjectNode();
        req.put("model", placementModel);
        req.put("temperature", 0.1);
        req.put("max_tokens", 2000);

        ObjectNode responseFormat = req.putObject("response_format");
        responseFormat.put("type", "json_object");

        ArrayNode messages = req.putArray("messages");

        // System message
        ObjectNode system = messages.addObject();
        system.put("role", "system");
        system.put("content", systemPrompt);

        // User message with text + images
        ObjectNode user = messages.addObject();
        user.put("role", "user");
        ArrayNode content = user.putArray("content");

        // Text part
        ObjectNode textPart = content.addObject();
        textPart.put("type", "text");
        textPart.put("text", userPrompt);

        // Image parts
        for (PageImage img : images) {
            ObjectNode imagePart = content.addObject();
            imagePart.put("type", "image_url");
            ObjectNode imageUrl = imagePart.putObject("image_url");
            imageUrl.put("url", "data:image/png;base64," + img.base64);
            imageUrl.put("detail", "high");
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(base + "/chat/completions"))
                .header("Authorization", "Bearer " + openAiApiKey)
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(req), StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new RuntimeException("OpenAI Vision call failed: HTTP " + response.statusCode() + " - " + response.body());
        }

        JsonNode body = mapper.readTree(response.body());
        JsonNode contentNode = body.path("choices").path(0).path("message").path("content");
        if (contentNode.isMissingNode() || contentNode.asText().isBlank()) {
            throw new RuntimeException("OpenAI Vision response did not contain content");
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
                try {
                    return mapper.readTree(raw.substring(start, end + 1));
                } catch (IOException second) {
                    throw new RuntimeException("Vision output was not valid JSON", second);
                }
            }
            throw new RuntimeException("Vision output was not valid JSON", first);
        }
    }

    private String loadPrompt(String path) throws IOException {
        ClassPathResource resource = new ClassPathResource(path);
        return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
    }

    private record PageInfo(int pageNum, float width, float height) {}
    private record PageImage(int pageNum, String base64) {}
}
