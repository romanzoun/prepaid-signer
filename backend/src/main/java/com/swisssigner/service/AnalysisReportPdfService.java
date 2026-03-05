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
            float y;

            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                y = JustSignPdfTemplateSupport.drawHeader(document, page, content, margin);
                y = JustSignPdfTemplateSupport.writeCentered(
                    content,
                    reportSubtitle(locale),
                    PDType1Font.HELVETICA,
                    9.5f,
                    width,
                    y,
                    JustSignPdfTemplateSupport.MUTED_R,
                    JustSignPdfTemplateSupport.MUTED_G,
                    JustSignPdfTemplateSupport.MUTED_B
                );
                y -= 22f;

                y = JustSignPdfTemplateSupport.writeCentered(
                    content,
                    reportTitle(locale),
                    PDType1Font.HELVETICA_BOLD,
                    20f,
                    width,
                    y,
                    JustSignPdfTemplateSupport.PRIMARY_R,
                    JustSignPdfTemplateSupport.PRIMARY_G,
                    JustSignPdfTemplateSupport.PRIMARY_B
                );
                y -= 16f;
                y = JustSignPdfTemplateSupport.writeCentered(
                    content,
                    processLabel(locale) + analysisProcessId,
                    PDType1Font.HELVETICA,
                    10f,
                    width,
                    y,
                    JustSignPdfTemplateSupport.BODY_R,
                    JustSignPdfTemplateSupport.BODY_G,
                    JustSignPdfTemplateSupport.BODY_B
                );
                y -= 12f;
                String generated = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss 'UTC'")
                    .withZone(ZoneOffset.UTC)
                    .format(Instant.now());
                y = JustSignPdfTemplateSupport.writeCentered(
                    content,
                    createdLabel(locale) + generated,
                    PDType1Font.HELVETICA,
                    9.5f,
                    width,
                    y,
                    JustSignPdfTemplateSupport.MUTED_R,
                    JustSignPdfTemplateSupport.MUTED_G,
                    JustSignPdfTemplateSupport.MUTED_B
                );
                y -= 16f;

                y = writeSectionTitle(content, summaryLabel(locale), width, y);
                y -= 12f;
                y = JustSignPdfTemplateSupport.writeWrapped(
                    content,
                    safeSummary(analysisResult),
                    PDType1Font.HELVETICA,
                    10f,
                    margin,
                    y,
                    width - (2 * margin),
                    JustSignPdfTemplateSupport.BODY_R,
                    JustSignPdfTemplateSupport.BODY_G,
                    JustSignPdfTemplateSupport.BODY_B
                );
                y -= 8f;

                y = JustSignPdfTemplateSupport.writeCentered(
                    content,
                    confidenceLabel(locale) + safeConfidence(analysisResult),
                    PDType1Font.HELVETICA_BOLD,
                    10f,
                    width,
                    y,
                    JustSignPdfTemplateSupport.MUTED_R,
                    JustSignPdfTemplateSupport.MUTED_G,
                    JustSignPdfTemplateSupport.MUTED_B
                );
                y -= 12f;

                y = writeSectionTitle(content, keyDatesLabel(locale), width, y);
                y -= 10f;
                y = JustSignPdfTemplateSupport.writeWrapped(
                    content,
                    listText(safeList(analysisResult, "key_dates"), "date", "label"),
                    PDType1Font.HELVETICA,
                    9.6f,
                    margin,
                    y,
                    width - (2 * margin),
                    JustSignPdfTemplateSupport.BODY_R,
                    JustSignPdfTemplateSupport.BODY_G,
                    JustSignPdfTemplateSupport.BODY_B
                );
                y -= 10f;

                y = writeSectionTitle(content, risksLabel(locale), width, y);
                y -= 10f;
                y = JustSignPdfTemplateSupport.writeWrapped(
                    content,
                    listText(safeList(analysisResult, "risks"), "risk", "title"),
                    PDType1Font.HELVETICA,
                    9.6f,
                    margin,
                    y,
                    width - (2 * margin),
                    JustSignPdfTemplateSupport.BODY_R,
                    JustSignPdfTemplateSupport.BODY_G,
                    JustSignPdfTemplateSupport.BODY_B
                );
                y -= 10f;

                y = writeSectionTitle(content, opportunitiesLabel(locale), width, y);
                y -= 10f;
                JustSignPdfTemplateSupport.writeWrapped(
                    content,
                    listText(safeList(analysisResult, "opportunities"), "opportunity", "title"),
                    PDType1Font.HELVETICA,
                    9.6f,
                    margin,
                    y,
                    width - (2 * margin),
                    JustSignPdfTemplateSupport.BODY_R,
                    JustSignPdfTemplateSupport.BODY_G,
                    JustSignPdfTemplateSupport.BODY_B
                );
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        }
    }

    private float writeSectionTitle(PDPageContentStream content, String title, float pageWidth, float y) throws IOException {
        return JustSignPdfTemplateSupport.writeCentered(
            content,
            title,
            PDType1Font.HELVETICA_BOLD,
            13f,
            pageWidth,
            y,
            JustSignPdfTemplateSupport.PRIMARY_R,
            JustSignPdfTemplateSupport.PRIMARY_G,
            JustSignPdfTemplateSupport.PRIMARY_B
        );
    }

    private String reportTitle(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "Rapport analyse IA";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "AI Analysis Report";
        return "KI-Analysebericht";
    }

    private String reportSubtitle(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "Resultat d analyse genere automatiquement";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "Automatically generated analysis result";
        return "Automatisch erstelltes Analyseergebnis";
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

    private String keyDatesLabel(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "Dates importantes";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "Key dates";
        return "Wichtige Daten";
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
        if (summary instanceof Map<?, ?> map) {
            Object executive = map.get("executive");
            if (executive instanceof String s && !s.isBlank()) return s;
            Object plain = map.get("plain_language");
            if (plain instanceof String s && !s.isBlank()) return s;
        }
        Object executiveSummary = analysisResult == null ? null : analysisResult.get("executive_summary");
        if (executiveSummary instanceof String s && !s.isBlank()) return s;
        return "n/a";
    }

    @SuppressWarnings("unchecked")
    private String safeConfidence(Map<String, Object> analysisResult) {
        Object confidence = analysisResult == null ? null : analysisResult.get("confidence");
        if (confidence instanceof Number n) {
            return String.valueOf(n.intValue()) + "/100";
        }
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
        if (!(value instanceof List<?>)) {
            if ("risks".equals(key)) {
                value = analysisResult == null ? null : analysisResult.get("top_risks");
            } else if ("opportunities".equals(key)) {
                value = analysisResult == null ? null : analysisResult.get("top_opportunities");
            }
        }
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

    private Locale resolveLocale(String language) {
        if (language == null || language.isBlank()) return Locale.GERMAN;
        String normalized = language.toLowerCase(Locale.ROOT);
        if (normalized.startsWith("fr")) return Locale.FRENCH;
        if (normalized.startsWith("en")) return Locale.ENGLISH;
        return Locale.GERMAN;
    }
}
