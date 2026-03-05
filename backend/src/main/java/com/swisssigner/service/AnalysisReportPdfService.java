package com.swisssigner.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class AnalysisReportPdfService {

    public byte[] createReport(String analysisProcessId, Map<String, Object> analysisResult, String language) throws IOException {
        Locale locale = resolveLocale(language);
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            float margin = 52f;
            float width = page.getMediaBox().getWidth();
            float y = page.getMediaBox().getHeight() - margin;

            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                content.setNonStrokingColor(22, 82, 240);
                content.addRect(0, page.getMediaBox().getHeight() - 100, width, 100);
                content.fill();

                write(content, "justSign", PDType1Font.HELVETICA_BOLD, 26, margin, page.getMediaBox().getHeight() - 52, true);
                write(content, reportTitle(locale), PDType1Font.HELVETICA, 11, margin, page.getMediaBox().getHeight() - 72, true);
                y = page.getMediaBox().getHeight() - 124;

                y = write(content, processLabel(locale) + analysisProcessId, PDType1Font.HELVETICA_BOLD, 11, margin, y, false);
                y -= 18;
                String generated = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss 'UTC'")
                    .withZone(ZoneOffset.UTC)
                    .format(Instant.now());
                y = write(content, createdLabel(locale) + generated, PDType1Font.HELVETICA, 10, margin, y, false);
                y -= 18;

                y = write(content, summaryLabel(locale), PDType1Font.HELVETICA_BOLD, 12, margin, y, false);
                y -= 14;
                y = writeWrapped(content, safeSummary(analysisResult), PDType1Font.HELVETICA, 10, margin, y, width - (2 * margin));
                y -= 8;

                y = write(content, confidenceLabel(locale) + safeConfidence(analysisResult), PDType1Font.HELVETICA_BOLD, 11, margin, y, false);
                y -= 18;

                y = write(content, risksLabel(locale), PDType1Font.HELVETICA_BOLD, 12, margin, y, false);
                y -= 14;
                y = writeWrapped(content, listText(safeList(analysisResult, "risks"), "risk", "title"), PDType1Font.HELVETICA, 10, margin, y, width - (2 * margin));
                y -= 8;

                y = write(content, opportunitiesLabel(locale), PDType1Font.HELVETICA_BOLD, 12, margin, y, false);
                y -= 14;
                writeWrapped(content, listText(safeList(analysisResult, "opportunities"), "opportunity", "title"), PDType1Font.HELVETICA, 10, margin, y, width - (2 * margin));
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        }
    }

    private String reportTitle(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "Rapport analyse IA";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "AI Analysis Report";
        return "KI-Analysebericht";
    }

    private String processLabel(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "analyticProcessID: ";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "analyticProcessID: ";
        return "analyticProcessID: ";
    }

    private String createdLabel(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "Cree le: ";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "Created at: ";
        return "Erstellt am: ";
    }

    private String summaryLabel(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "Resume";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "Summary";
        return "Zusammenfassung";
    }

    private String confidenceLabel(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "Confiance: ";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "Confidence: ";
        return "Confidence: ";
    }

    private String risksLabel(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "Risques principaux";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "Top Risks";
        return "Top Risiken";
    }

    private String opportunitiesLabel(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "Opportunites principales";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "Top Opportunities";
        return "Top Chancen";
    }

    private String safeSummary(Map<String, Object> analysisResult) {
        Object summary = analysisResult == null ? null : analysisResult.get("summary");
        if (summary instanceof String s && !s.isBlank()) return s;
        return "n/a";
    }

    @SuppressWarnings("unchecked")
    private String safeConfidence(Map<String, Object> analysisResult) {
        Object confidence = analysisResult == null ? null : analysisResult.get("confidence");
        if (confidence instanceof Map<?, ?> map) {
            Object score = map.get("overall_score");
            if (score == null) score = map.get("score");
            if (score != null) return String.valueOf(score) + "/100";
        }
        return "n/a";
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> safeList(Map<String, Object> analysisResult, String key) {
        Object value = analysisResult == null ? null : analysisResult.get(key);
        if (value instanceof List<?> list) {
            List<Map<String, Object>> out = new ArrayList<>();
            for (Object item : list) {
                if (item instanceof Map<?, ?> map) {
                    out.add((Map<String, Object>) map);
                }
                if (out.size() >= 5) break;
            }
            return out;
        }
        return List.of();
    }

    private String listText(List<Map<String, Object>> list, String primaryKey, String secondaryKey) {
        if (list.isEmpty()) return "- n/a";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < list.size(); i++) {
            Map<String, Object> item = list.get(i);
            Object text = item.get(primaryKey);
            if (text == null) text = item.get(secondaryKey);
            if (text == null) text = "n/a";
            sb.append(i + 1).append(") ").append(String.valueOf(text));
            if (i < list.size() - 1) sb.append("\n");
        }
        return sb.toString();
    }

    private float write(PDPageContentStream content,
                        String text,
                        PDType1Font font,
                        float fontSize,
                        float x,
                        float y,
                        boolean inverseColor) throws IOException {
        content.setNonStrokingColor(inverseColor ? 255 : 18, inverseColor ? 255 : 27, inverseColor ? 255 : 44);
        content.beginText();
        content.setFont(font, fontSize);
        content.newLineAtOffset(x, y);
        content.showText(text == null ? "" : text);
        content.endText();
        return y;
    }

    private float writeWrapped(PDPageContentStream content,
                               String text,
                               PDType1Font font,
                               float fontSize,
                               float x,
                               float y,
                               float maxWidth) throws IOException {
        float cursor = y;
        for (String line : wrap(text == null ? "" : text, font, fontSize, maxWidth)) {
            write(content, line, font, fontSize, x, cursor, false);
            cursor -= (fontSize + 3);
        }
        return cursor;
    }

    private List<String> wrap(String text, PDType1Font font, float fontSize, float maxWidth) throws IOException {
        List<String> lines = new ArrayList<>();
        String[] words = text.split("\\s+");
        StringBuilder line = new StringBuilder();
        for (String word : words) {
            String candidate = line.isEmpty() ? word : line + " " + word;
            float width = font.getStringWidth(candidate) / 1000f * fontSize;
            if (width <= maxWidth) {
                line.setLength(0);
                line.append(candidate);
            } else {
                if (!line.isEmpty()) lines.add(line.toString());
                line.setLength(0);
                line.append(word);
            }
        }
        if (!line.isEmpty()) lines.add(line.toString());
        return lines;
    }

    private Locale resolveLocale(String language) {
        if (language == null || language.isBlank()) return Locale.GERMAN;
        String normalized = language.toLowerCase(Locale.ROOT);
        if (normalized.startsWith("fr")) return Locale.FRENCH;
        if (normalized.startsWith("en")) return Locale.ENGLISH;
        return Locale.GERMAN;
    }
}
