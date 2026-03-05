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
public class ConfirmationPdfService {

    public byte[] createProcessStartConfirmation(String processId,
                                                 String statusUrl,
                                                 String language,
                                                 Map<String, Object> analysisResult) throws IOException {
        Locale locale = resolveLocale(language);
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            float margin = 52f;
            float pageWidth = page.getMediaBox().getWidth();
            float y = page.getMediaBox().getHeight() - margin;

            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                // Header band
                content.setNonStrokingColor(22, 82, 240);
                content.addRect(0, page.getMediaBox().getHeight() - 110, pageWidth, 110);
                content.fill();

                write(content, "justSign", PDType1Font.HELVETICA_BOLD, 28, margin, page.getMediaBox().getHeight() - 56, true);
                write(content, "Powered by Swisscom Sign API", PDType1Font.HELVETICA, 11, margin, page.getMediaBox().getHeight() - 74, true);
                y = page.getMediaBox().getHeight() - 130;

                y = write(content, title(locale), PDType1Font.HELVETICA_BOLD, 18, margin, y, false);
                y -= 16;
                y = write(content, subtitle(locale), PDType1Font.HELVETICA, 11, margin, y, false);
                y -= 20;

                y = write(content, sectionDoneTitle(locale), PDType1Font.HELVETICA_BOLD, 13, margin, y, false);
                y -= 14;
                y = writeWrapped(content, sectionDoneBody(locale), PDType1Font.HELVETICA, 11, margin, y, pageWidth - (2 * margin));
                y -= 8;

                y = write(content, sectionNextTitle(locale), PDType1Font.HELVETICA_BOLD, 13, margin, y, false);
                y -= 14;
                y = writeWrapped(content, sectionNextBody(locale), PDType1Font.HELVETICA, 11, margin, y, pageWidth - (2 * margin));
                y -= 12;

                y = write(content, sectionProcessIdTitle(locale), PDType1Font.HELVETICA_BOLD, 13, margin, y, false);
                y -= 10;
                y = drawProcessIdBox(content, processId, margin, y, pageWidth - (2 * margin));
                y -= 16;

                y = write(content, sectionUseIdTitle(locale), PDType1Font.HELVETICA_BOLD, 13, margin, y, false);
                y -= 14;
                y = writeWrapped(content, sectionUseIdBody(locale), PDType1Font.HELVETICA, 11, margin, y, pageWidth - (2 * margin));
                y -= 8;
                y = write(content, statusLabel(locale), PDType1Font.HELVETICA_BOLD, 11, margin, y, false);
                y -= 12;
                y = writeWrapped(content, statusUrl, PDType1Font.COURIER, 10, margin, y, pageWidth - (2 * margin));
                y -= 10;
                String createdAt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss 'UTC'")
                    .withZone(ZoneOffset.UTC)
                    .format(Instant.now());
                y = write(content, createdAtLabel(locale) + createdAt, PDType1Font.HELVETICA, 10, margin, y, false);
                y -= 16;

                if (analysisResult != null && !analysisResult.isEmpty()) {
                    y = write(content, sectionAnalysisTitle(locale), PDType1Font.HELVETICA_BOLD, 13, margin, y, false);
                    y -= 14;
                    y = writeWrapped(content, analysisSummary(locale, analysisResult), PDType1Font.HELVETICA, 11, margin, y, pageWidth - (2 * margin));
                    y -= 10;
                }

                y = write(
                    content,
                    sectionSupportTitle(locale, analysisResult != null && !analysisResult.isEmpty()),
                    PDType1Font.HELVETICA_BOLD,
                    13,
                    margin,
                    y,
                    false
                );
                y -= 14;
                y = writeWrapped(content, sectionSupportBody(locale), PDType1Font.HELVETICA, 11, margin, y, pageWidth - (2 * margin));
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        }
    }

    private float write(PDPageContentStream content,
                        String text,
                        PDType1Font font,
                        float fontSize,
                        float x,
                        float y,
                        boolean inverseColor) throws IOException {
        if (inverseColor) {
            content.setNonStrokingColor(255, 255, 255);
        } else {
            content.setNonStrokingColor(18, 27, 44);
        }
        content.beginText();
        content.setFont(font, fontSize);
        content.newLineAtOffset(x, y);
        content.showText(text);
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
        String[] paragraphs = text.split("\\n", -1);
        for (int p = 0; p < paragraphs.length; p++) {
            String paragraph = paragraphs[p].trim();
            if (paragraph.isEmpty()) {
                cursor -= (fontSize + 3);
                continue;
            }
            List<String> lines = wrap(paragraph, font, fontSize, maxWidth);
            for (String line : lines) {
                write(content, line, font, fontSize, x, cursor, false);
                cursor -= (fontSize + 3);
            }
            if (p < paragraphs.length - 1) {
                cursor -= 3f;
            }
        }
        return cursor;
    }

    private float drawProcessIdBox(PDPageContentStream content,
                                   String processId,
                                   float x,
                                   float topY,
                                   float width) throws IOException {
        float height = 34f;
        float y = topY - height;
        content.setNonStrokingColor(245, 247, 252);
        content.addRect(x, y, width, height);
        content.fill();

        content.setStrokingColor(204, 212, 228);
        content.addRect(x, y, width, height);
        content.stroke();

        write(content, processId, PDType1Font.COURIER_BOLD, 12, x + 10, y + 11, false);
        return y;
    }

    private List<String> wrap(String text, PDType1Font font, float fontSize, float maxWidth) throws IOException {
        List<String> lines = new ArrayList<>();
        String[] words = text.split("\\s+");
        StringBuilder line = new StringBuilder();
        for (String word : words) {
            if ((font.getStringWidth(word) / 1000f * fontSize) > maxWidth) {
                if (!line.isEmpty()) {
                    lines.add(line.toString());
                    line.setLength(0);
                }
                lines.addAll(splitLongWord(word, font, fontSize, maxWidth));
                continue;
            }
            String candidate = line.isEmpty() ? word : line + " " + word;
            float width = font.getStringWidth(candidate) / 1000f * fontSize;
            if (width <= maxWidth) {
                line.setLength(0);
                line.append(candidate);
            } else {
                if (!line.isEmpty()) {
                    lines.add(line.toString());
                }
                line.setLength(0);
                line.append(word);
            }
        }
        if (!line.isEmpty()) {
            lines.add(line.toString());
        }
        return lines;
    }

    private List<String> splitLongWord(String word, PDType1Font font, float fontSize, float maxWidth) throws IOException {
        List<String> chunks = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        for (int i = 0; i < word.length(); i++) {
            current.append(word.charAt(i));
            float width = font.getStringWidth(current.toString()) / 1000f * fontSize;
            if (width > maxWidth) {
                if (current.length() == 1) {
                    chunks.add(current.toString());
                    current.setLength(0);
                } else {
                    String carry = current.substring(current.length() - 1);
                    current.setLength(current.length() - 1);
                    chunks.add(current.toString());
                    current.setLength(0);
                    current.append(carry);
                }
            }
        }
        if (!current.isEmpty()) {
            chunks.add(current.toString());
        }
        return chunks;
    }

    private Locale resolveLocale(String language) {
        if (language == null || language.isBlank()) {
            return Locale.GERMAN;
        }
        String normalized = language.trim().toLowerCase(Locale.ROOT);
        if (normalized.startsWith("fr")) return Locale.FRENCH;
        if (normalized.startsWith("en")) return Locale.ENGLISH;
        return Locale.GERMAN;
    }

    private String title(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "Confirmation du demarrage du processus";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "Process Start Confirmation";
        return "Bestaetigung des Prozessstarts";
    }

    private String subtitle(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "Ce document confirme le lancement de votre processus de signature numerique.";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "This document confirms that your digital signing process has been started.";
        return "Dieses Dokument bestaetigt den Start Ihres digitalen Signaturprozesses.";
    }

    private String sectionDoneTitle(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "1) Ce qui a ete fait";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "1) What has been done";
        return "1) Was Sie gemacht haben";
    }

    private String sectionDoneBody(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) {
            return "Votre document a ete prepare et le processus de signature a ete declenche.";
        }
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) {
            return "Your document was prepared and the signing workflow was started.";
        }
        return "Ihr Dokument wurde vorbereitet und der Signaturablauf wurde gestartet.";
    }

    private String sectionNextTitle(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "2) Comment le processus continue";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "2) How the process continues";
        return "2) Wie es weitergeht";
    }

    private String sectionNextBody(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) {
            return "1) Les signataires recoivent leur invitation. 2) Ils signent le document. 3) Quand le statut est COMPLETED, tous les signataires ont recu une copie signee. Si vous souhaitez archiver, demandez le transfert du document signe.";
        }
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) {
            return "1) Signers receive their invitations. 2) They sign the document. 3) When status is COMPLETED, all signers have received a signed copy. If you need archiving, ask for the signed document to be forwarded.";
        }
        return "1) Unterzeichner erhalten ihre Einladungen. 2) Sie signieren das Dokument. 3) Wenn der Status COMPLETED ist, haben alle Unterzeichner eine unterschriebene Kopie erhalten. Fuer die Archivierung lassen Sie sich das signierte Dokument weiterleiten.";
    }

    private String sectionProcessIdTitle(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "3) Process ID";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "3) Process ID";
        return "3) Process-ID";
    }

    private String sectionUseIdTitle(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "4) Comment utiliser le Process ID";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "4) How to use the Process ID";
        return "4) So verwenden Sie die Process-ID";
    }

    private String sectionUseIdBody(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) {
            return "Utilisez ce Process ID dans le status checker justSign pour consulter l avancement. Indiquez toujours ce Process ID en cas de question au support.";
        }
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) {
            return "Use this Process ID in the justSign status checker to view progress. Include this Process ID in every support request.";
        }
        return "Nutzen Sie diese Process-ID im justSign Status Checker, um den Fortschritt zu sehen. Geben Sie diese Process-ID bei jeder Support-Anfrage an.";
    }

    private String statusLabel(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "Status checker URL:";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "Status checker URL:";
        return "Status-Checker-URL:";
    }

    private String createdAtLabel(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "Cree le: ";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "Created at: ";
        return "Erstellt am: ";
    }

    private String sectionSupportTitle(Locale locale, boolean withAnalysisSection) {
        String prefix = withAnalysisSection ? "6) " : "5) ";
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return prefix + "Support Swisscom Sign";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return prefix + "Swisscom Sign support options";
        return prefix + "Swisscom Sign Support-Moeglichkeiten";
    }

    private String sectionSupportBody(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) {
            return "1) Support & Services (formulaire de support): https://trustservices.swisscom.com/en/support\n"
                + "2) Help Center (Signing Service): https://trustservices.swisscom.com/en/support/help-center/signing-service\n"
                + "3) Service Status: https://trustservices.swisscom.com/en/support/developer-section/service-status?hsLang=en\n"
                + "4) Developer Hub (API): https://dev.trustservices.swisscom.com/";
        }
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) {
            return "1) Support & Services (support form): https://trustservices.swisscom.com/en/support\n"
                + "2) Help Center (Signing Service): https://trustservices.swisscom.com/en/support/help-center/signing-service\n"
                + "3) Service Status: https://trustservices.swisscom.com/en/support/developer-section/service-status?hsLang=en\n"
                + "4) Developer Hub (API): https://dev.trustservices.swisscom.com/";
        }
        return "1) Support & Services (Support-Formular): https://trustservices.swisscom.com/de/support\n"
            + "2) Help Center (Signing Service): https://trustservices.swisscom.com/de/support/help-center/signing-service\n"
            + "3) Service-Status: https://trustservices.swisscom.com/de/support/developer-section/service-status?hsLang=de\n"
            + "4) Developer Hub (API): https://dev.trustservices.swisscom.com/";
    }

    private String sectionAnalysisTitle(Locale locale) {
        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) return "5) Resultat de l analyse IA (CHF 1.00)";
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) return "5) AI analysis result (CHF 1.00)";
        return "5) KI-Analyse-Ergebnis (CHF 1.00)";
    }

    @SuppressWarnings("unchecked")
    private String analysisSummary(Locale locale, Map<String, Object> analysisResult) {
        String summary = extractAnalysisSummary(analysisResult);
        String confidence = extractConfidence(analysisResult);
        String keyDate = extractTopKeyDate(analysisResult);
        String topRisk = extractTopRisk(analysisResult);

        if (Locale.FRENCH.getLanguage().equals(locale.getLanguage())) {
            return "Contenu: resume, dates importantes, obligations, risques, opportunites et score de confiance.\n"
                + "Resume: " + crop(summary, 260) + "\n"
                + "Confiance: " + confidence + "\n"
                + "Date importante: " + keyDate + "\n"
                + "Risque principal: " + crop(topRisk, 150);
        }
        if (Locale.ENGLISH.getLanguage().equals(locale.getLanguage())) {
            return "Included: summary, key dates, obligations, risks, opportunities, and confidence scoring.\n"
                + "Summary: " + crop(summary, 260) + "\n"
                + "Confidence: " + confidence + "\n"
                + "Key date: " + keyDate + "\n"
                + "Top risk: " + crop(topRisk, 150);
        }
        return "Enthalten: Zusammenfassung, wichtige Daten, Pflichten, Risiken, Chancen und Confidence-Score.\n"
            + "Zusammenfassung: " + crop(summary, 260) + "\n"
            + "Confidence: " + confidence + "\n"
            + "Wichtiges Datum: " + keyDate + "\n"
            + "Top-Risiko: " + crop(topRisk, 150);
    }

    @SuppressWarnings("unchecked")
    private String extractAnalysisSummary(Map<String, Object> analysisResult) {
        Object summary = analysisResult.get("summary");
        if (summary instanceof String s && !s.isBlank()) {
            return s.trim();
        }
        if (summary instanceof Map<?, ?> map) {
            Object exec = map.get("executive");
            if (exec instanceof String s && !s.isBlank()) {
                return s.trim();
            }
        }
        return "No summary available.";
    }

    @SuppressWarnings("unchecked")
    private String extractConfidence(Map<String, Object> analysisResult) {
        Object confidence = analysisResult.get("confidence");
        if (confidence instanceof Map<?, ?> map) {
            Object score = map.get("overall_score");
            if (score == null) {
                score = map.get("score");
            }
            if (score != null) {
                return String.valueOf(score) + "/100";
            }
        }
        return "n/a";
    }

    @SuppressWarnings("unchecked")
    private String extractTopKeyDate(Map<String, Object> analysisResult) {
        Object keyDates = analysisResult.get("key_dates");
        if (keyDates instanceof List<?> list && !list.isEmpty() && list.getFirst() instanceof Map<?, ?> first) {
            String date = first.get("date") == null ? "" : String.valueOf(first.get("date"));
            String label = first.get("label") == null ? "" : String.valueOf(first.get("label"));
            String combined = (date + " " + label).trim();
            if (!combined.isBlank()) {
                return combined;
            }
        }
        return "n/a";
    }

    @SuppressWarnings("unchecked")
    private String extractTopRisk(Map<String, Object> analysisResult) {
        Object risks = analysisResult.get("risks");
        if (risks instanceof List<?> list && !list.isEmpty() && list.getFirst() instanceof Map<?, ?> first) {
            Object risk = first.get("risk");
            if (risk == null) {
                risk = first.get("title");
            }
            if (risk != null) {
                return String.valueOf(risk);
            }
        }
        return "n/a";
    }

    private String crop(String value, int maxLen) {
        if (value == null || value.isBlank()) {
            return "n/a";
        }
        String normalized = value.replaceAll("\\s+", " ").trim();
        if (normalized.length() <= maxLen) {
            return normalized;
        }
        return normalized.substring(0, maxLen - 3) + "...";
    }
}
