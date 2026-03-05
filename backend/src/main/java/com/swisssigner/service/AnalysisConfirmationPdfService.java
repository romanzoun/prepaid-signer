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
public class AnalysisConfirmationPdfService {

    public byte[] createConfirmation(String analysisProcessId,
                                     String status,
                                     String statusUrl,
                                     String language,
                                     Map<String, Object> analysisResult) throws IOException {
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
                write(content, "Powered by Swisscom Sign API", PDType1Font.HELVETICA, 11, margin, page.getMediaBox().getHeight() - 72, true);
                y = page.getMediaBox().getHeight() - 124;

                y = write(content, title(locale), PDType1Font.HELVETICA_BOLD, 16, margin, y, false);
                y -= 18;

                y = write(content, "analyticProcessID: " + analysisProcessId, PDType1Font.HELVETICA_BOLD, 11, margin, y, false);
                y -= 15;
                y = write(content, statusLabel(locale) + status, PDType1Font.HELVETICA_BOLD, 11, margin, y, false);
                y -= 15;
                String generated = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss 'UTC'")
                    .withZone(ZoneOffset.UTC)
                    .format(Instant.now());
                y = write(content, createdLabel(locale) + generated, PDType1Font.HELVETICA, 10, margin, y, false);
                y -= 18;

                y = write(content, usageTitle(locale), PDType1Font.HELVETICA_BOLD, 12, margin, y, false);
                y -= 12;
                y = writeWrapped(content, usageBody(locale), PDType1Font.HELVETICA, 10, margin, y, width - (2 * margin));
                y -= 8;
                y = write(content, statusUrlLabel(locale), PDType1Font.HELVETICA_BOLD, 10, margin, y, false);
                y -= 11;
                y = writeWrapped(content, statusUrl, PDType1Font.COURIER, 9, margin, y, width - (2 * margin));
                y -= 12;

                if (analysisResult != null && !analysisResult.isEmpty()) {
                    y = write(content, resultTitle(locale), PDType1Font.HELVETICA_BOLD, 12, margin, y, false);
                    y -= 12;
                    y = writeWrapped(content, summaryLine(locale) + safeSummary(analysisResult), PDType1Font.HELVETICA, 10, margin, y, width - (2 * margin));
                    y -= 6;
                    y = write(content, confidenceLine(locale) + safeConfidence(analysisResult), PDType1Font.HELVETICA_BOLD, 10, margin, y, false);
                    y -= 12;
                    y = write(content, keyDatesTitle(locale), PDType1Font.HELVETICA_BOLD, 11, margin, y, false);
                    y -= 11;
                    writeWrapped(content, listText(safeList(analysisResult, "key_dates"), "date", "label"), PDType1Font.HELVETICA, 10, margin, y, width - (2 * margin));
                }
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        }
    }

    private String title(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "Confirmation du processus d analyse IA";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "AI Analysis Process Confirmation";
        return "Bestaetigung AI-Analyseprozess";
    }

    private String statusLabel(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "Statut: ";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "Status: ";
        return "Status: ";
    }

    private String createdLabel(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "Cree le: ";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "Created at: ";
        return "Erstellt am: ";
    }

    private String usageTitle(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "Utilisation de l analyticProcessID";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "How to use analyticProcessID";
        return "So verwenden Sie die analyticProcessID";
    }

    private String usageBody(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) {
            return "Saisissez cet analyticProcessID dans le status checker justSign pour recuperer l avancement et les resultats de l analyse.";
        }
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) {
            return "Enter this analyticProcessID in the justSign status checker to retrieve analysis progress and results.";
        }
        return "Geben Sie diese analyticProcessID im justSign Status Checker ein, um Fortschritt und Ergebnisse der Analyse abzurufen.";
    }

    private String statusUrlLabel(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "URL status checker:";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "Status checker URL:";
        return "Status-Checker-URL:";
    }

    private String resultTitle(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "Resultat actuel";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "Current result snapshot";
        return "Aktueller Ergebnisstand";
    }

    private String summaryLine(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "Resume: ";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "Summary: ";
        return "Zusammenfassung: ";
    }

    private String confidenceLine(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "Confiance: ";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "Confidence: ";
        return "Confidence: ";
    }

    private String keyDatesTitle(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "Dates importantes";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "Key dates";
        return "Wichtige Daten";
    }

    private String safeSummary(Map<String, Object> analysisResult) {
        Object summary = analysisResult.get("summary");
        if (summary instanceof String s && !s.isBlank()) return s;
        return "n/a";
    }

    @SuppressWarnings("unchecked")
    private String safeConfidence(Map<String, Object> analysisResult) {
        Object confidence = analysisResult.get("confidence");
        if (confidence instanceof Map<?, ?> map) {
            Object score = map.get("overall_score");
            if (score == null) score = map.get("score");
            if (score != null) return String.valueOf(score) + "/100";
        }
        return "n/a";
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> safeList(Map<String, Object> analysisResult, String key) {
        Object value = analysisResult.get(key);
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

    private String listText(List<Map<String, Object>> list, String firstKey, String secondKey) {
        if (list.isEmpty()) return "- n/a";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < list.size(); i++) {
            Map<String, Object> item = list.get(i);
            Object first = item.get(firstKey);
            Object second = item.get(secondKey);
            String firstStr = first == null ? "n/a" : String.valueOf(first);
            String secondStr = second == null ? "" : String.valueOf(second);
            sb.append(i + 1).append(") ").append(firstStr);
            if (!secondStr.isBlank() && !secondStr.equals("n/a")) {
                sb.append(" - ").append(secondStr);
            }
            if (i < list.size() - 1) sb.append("\n");
        }
        return sb.toString();
    }

    private float write(PDPageContentStream content,
                        String text,
                        PDType1Font font,
                        float size,
                        float x,
                        float y,
                        boolean inverseColor) throws IOException {
        content.setNonStrokingColor(inverseColor ? 255 : 18, inverseColor ? 255 : 27, inverseColor ? 255 : 44);
        content.beginText();
        content.setFont(font, size);
        content.newLineAtOffset(x, y);
        content.showText(text == null ? "" : text);
        content.endText();
        return y;
    }

    private float writeWrapped(PDPageContentStream content,
                               String text,
                               PDType1Font font,
                               float size,
                               float x,
                               float y,
                               float maxWidth) throws IOException {
        float cursor = y;
        for (String line : wrap(text == null ? "" : text, font, size, maxWidth)) {
            write(content, line, font, size, x, cursor, false);
            cursor -= (size + 3);
        }
        return cursor;
    }

    private List<String> wrap(String text, PDType1Font font, float size, float maxWidth) throws IOException {
        List<String> lines = new ArrayList<>();
        String[] words = text.split("\\s+");
        StringBuilder line = new StringBuilder();
        for (String word : words) {
            String candidate = line.isEmpty() ? word : line + " " + word;
            float width = font.getStringWidth(candidate) / 1000f * size;
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
