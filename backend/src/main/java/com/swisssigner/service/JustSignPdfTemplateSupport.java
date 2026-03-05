package com.swisssigner.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

final class JustSignPdfTemplateSupport {

    private static final String SWISSCOM_LOGO = "/pdf/templates/swisscom-logo.png";
    private static final String DATA_SWISSCOM_LOGO = "swisscom-logo.png";
    private static final String DATA_JUSTSIGN_LOGO = "justsign-logo.png";
    private static final String ANALYSE_TEMPLATE = "JustSignAnalyseTemplate.docx";
    private static final String EMAIL_TEMPLATE = "JustSignEmailTemplate.docx";
    private static final String TEMPLATE_SWISSCOM_IMAGE_ENTRY = "word/media/image2.png";
    private static final float JUSTSIGN_LOGO_WIDTH = 126f;
    private static final float JUSTSIGN_LOGO_HEIGHT = 35f;
    private static volatile byte[] swisscomLogoBytes;
    private static volatile byte[] justSignLogoBytes;

    static final int PRIMARY_R = 0;
    static final int PRIMARY_G = 17;
    static final int PRIMARY_B = 85;
    static final int BODY_R = 18;
    static final int BODY_G = 27;
    static final int BODY_B = 44;
    static final int MUTED_R = 136;
    static final int MUTED_G = 146;
    static final int MUTED_B = 166;

    private JustSignPdfTemplateSupport() {
    }

    static float drawHeader(PDDocument document,
                            PDPage page,
                            PDPageContentStream content,
                            float margin) throws IOException {
        float pageHeight = page.getMediaBox().getHeight();
        float pageWidth = page.getMediaBox().getWidth();

        PDImageXObject leftLogo = loadJustSignLogo(document);
        if (leftLogo != null) {
            drawImage(content, leftLogo, margin, pageHeight - 62f, JUSTSIGN_LOGO_WIDTH, JUSTSIGN_LOGO_HEIGHT);
        } else {
            float leftY = pageHeight - 58f;
            write(content, "just", PDType1Font.HELVETICA_BOLD, 28f, margin, leftY, 231, 0, 43);
            float justWidth = PDType1Font.HELVETICA_BOLD.getStringWidth("just") / 1000f * 28f;
            write(content, "Sign", PDType1Font.HELVETICA_BOLD, 28f, margin + justWidth + 1f, leftY, 0, 99, 204);
        }
        drawImage(content, loadSwisscomLogo(document), pageWidth - margin - 170f, pageHeight - 68f, 170f, 66f);

        content.setStrokingColor(225, 231, 242);
        content.setLineWidth(1f);
        content.moveTo(margin, pageHeight - 82f);
        content.lineTo(pageWidth - margin, pageHeight - 82f);
        content.stroke();
        return pageHeight - 102f;
    }

    static float write(PDPageContentStream content,
                       String text,
                       PDType1Font font,
                       float fontSize,
                       float x,
                       float y,
                       int r,
                       int g,
                       int b) throws IOException {
        content.setNonStrokingColor(r, g, b);
        content.beginText();
        content.setFont(font, fontSize);
        content.newLineAtOffset(x, y);
        content.showText(safe(text));
        content.endText();
        return y;
    }

    static float writeCentered(PDPageContentStream content,
                               String text,
                               PDType1Font font,
                               float fontSize,
                               float pageWidth,
                               float y,
                               int r,
                               int g,
                               int b) throws IOException {
        String safe = safe(text);
        float textWidth = font.getStringWidth(safe) / 1000f * fontSize;
        float x = Math.max(36f, (pageWidth - textWidth) / 2f);
        return write(content, safe, font, fontSize, x, y, r, g, b);
    }

    static float writeWrapped(PDPageContentStream content,
                              String text,
                              PDType1Font font,
                              float fontSize,
                              float x,
                              float y,
                              float maxWidth,
                              int r,
                              int g,
                              int b) throws IOException {
        float cursor = y;
        String[] paragraphs = (text == null ? "" : text).split("\\n", -1);
        for (int p = 0; p < paragraphs.length; p++) {
            String paragraph = safe(paragraphs[p]).trim();
            if (paragraph.isEmpty()) {
                cursor -= (fontSize + 3f);
                continue;
            }
            for (String line : wrap(paragraph, font, fontSize, maxWidth)) {
                write(content, line, font, fontSize, x, cursor, r, g, b);
                cursor -= (fontSize + 3f);
            }
            if (p < paragraphs.length - 1) {
                cursor -= 2f;
            }
        }
        return cursor;
    }

    static float writeWrappedCentered(PDPageContentStream content,
                                      String text,
                                      PDType1Font font,
                                      float fontSize,
                                      float pageWidth,
                                      float y,
                                      float maxWidth,
                                      int r,
                                      int g,
                                      int b) throws IOException {
        float cursor = y;
        String[] paragraphs = (text == null ? "" : text).split("\\n", -1);
        for (int p = 0; p < paragraphs.length; p++) {
            String paragraph = safe(paragraphs[p]).trim();
            if (paragraph.isEmpty()) {
                cursor -= (fontSize + 3f);
                continue;
            }
            for (String line : wrap(paragraph, font, fontSize, maxWidth)) {
                writeCentered(content, line, font, fontSize, pageWidth, cursor, r, g, b);
                cursor -= (fontSize + 3f);
            }
            if (p < paragraphs.length - 1) {
                cursor -= 2f;
            }
        }
        return cursor;
    }

    static float drawCenteredInfoBox(PDPageContentStream content,
                                     String text,
                                     float pageWidth,
                                     float topY,
                                     float width,
                                     float height) throws IOException {
        float x = (pageWidth - width) / 2f;
        float y = topY - height;
        content.setNonStrokingColor(245, 247, 252);
        content.addRect(x, y, width, height);
        content.fill();
        content.setStrokingColor(205, 214, 230);
        content.setLineWidth(1f);
        content.addRect(x, y, width, height);
        content.stroke();
        writeCentered(content, text, PDType1Font.COURIER_BOLD, 11f, pageWidth, y + (height / 2f) - 4f, BODY_R, BODY_G, BODY_B);
        return y;
    }

    private static void drawImage(PDPageContentStream content,
                                  PDImageXObject image,
                                  float x,
                                  float y,
                                  float width,
                                  float height) throws IOException {
        if (image == null) {
            return;
        }
        content.drawImage(image, x, y, width, height);
    }

    private static PDImageXObject loadSwisscomLogo(PDDocument document) throws IOException {
        byte[] bytes = swisscomLogoBytes;
        if (bytes == null) {
            synchronized (JustSignPdfTemplateSupport.class) {
                bytes = swisscomLogoBytes;
                if (bytes == null) {
                    bytes = loadSwisscomLogoBytes();
                    swisscomLogoBytes = bytes;
                }
            }
        }
        if (bytes == null || bytes.length == 0) {
            return null;
        }
        return PDImageXObject.createFromByteArray(document, bytes, "swisscom-logo");
    }

    private static PDImageXObject loadJustSignLogo(PDDocument document) throws IOException {
        byte[] bytes = justSignLogoBytes;
        if (bytes == null) {
            synchronized (JustSignPdfTemplateSupport.class) {
                bytes = justSignLogoBytes;
                if (bytes == null) {
                    bytes = loadLogoBytesFromDataFiles(DATA_JUSTSIGN_LOGO);
                    justSignLogoBytes = bytes;
                }
            }
        }
        if (bytes == null || bytes.length == 0) {
            return null;
        }
        return PDImageXObject.createFromByteArray(document, bytes, "justsign-logo");
    }

    private static byte[] loadSwisscomLogoBytes() throws IOException {
        byte[] direct = loadLogoBytesFromDataFiles(DATA_SWISSCOM_LOGO);
        if (direct != null && direct.length > 0) {
            return direct;
        }
        for (Path templatePath : resolveTemplateCandidates()) {
            byte[] extracted = extractImageFromDocx(templatePath, TEMPLATE_SWISSCOM_IMAGE_ENTRY);
            if (extracted != null && extracted.length > 0) {
                return extracted;
            }
        }
        try (InputStream input = JustSignPdfTemplateSupport.class.getResourceAsStream(SWISSCOM_LOGO)) {
            if (input == null) {
                return null;
            }
            return input.readAllBytes();
        }
    }

    private static byte[] loadLogoBytesFromDataFiles(String fileName) {
        for (Path baseDir : resolveDataBaseDirs()) {
            Path logoPath = baseDir.resolve(fileName);
            if (Files.exists(logoPath) && Files.isRegularFile(logoPath)) {
                try {
                    return Files.readAllBytes(logoPath);
                } catch (IOException ignored) {
                    return null;
                }
            }
        }
        return null;
    }

    private static List<Path> resolveTemplateCandidates() {
        List<Path> candidates = new ArrayList<>();
        String configuredDir = System.getenv("JUSTSIGN_TEMPLATE_DIR");
        if (configuredDir != null && !configuredDir.isBlank()) {
            Path customDir = Paths.get(configuredDir.trim());
            candidates.add(customDir.resolve(ANALYSE_TEMPLATE));
            candidates.add(customDir.resolve(EMAIL_TEMPLATE));
        }
        for (Path baseDir : resolveDataBaseDirs()) {
            candidates.add(baseDir.resolve(ANALYSE_TEMPLATE));
            candidates.add(baseDir.resolve(EMAIL_TEMPLATE));
        }
        return candidates;
    }

    private static List<Path> resolveDataBaseDirs() {
        List<Path> baseDirs = new ArrayList<>();
        String configuredDir = System.getenv("JUSTSIGN_TEMPLATE_DIR");
        if (configuredDir != null && !configuredDir.isBlank()) {
            baseDirs.add(Paths.get(configuredDir.trim()));
        }
        baseDirs.add(Paths.get("data"));
        baseDirs.add(Paths.get("/app", "data"));
        baseDirs.add(Paths.get("..", "data"));
        return baseDirs;
    }

    private static byte[] extractImageFromDocx(Path docxPath, String entryName) throws IOException {
        if (docxPath == null || !Files.exists(docxPath) || !Files.isRegularFile(docxPath)) {
            return null;
        }
        try (ZipFile zip = new ZipFile(docxPath.toFile())) {
            ZipEntry entry = zip.getEntry(entryName);
            if (entry == null) {
                return null;
            }
            try (InputStream input = zip.getInputStream(entry)) {
                return input.readAllBytes();
            }
        } catch (IOException ignored) {
            return null;
        }
    }

    private static List<String> wrap(String text, PDType1Font font, float fontSize, float maxWidth) throws IOException {
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

    private static List<String> splitLongWord(String word, PDType1Font font, float fontSize, float maxWidth) throws IOException {
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

    private static String safe(String text) {
        if (text == null) {
            return "";
        }
        return text
            .replace('\n', ' ')
            .replace('\r', ' ')
            .replace('\t', ' ')
            .replace('\u2013', '-')
            .replace('\u2014', '-')
            .replace('\u2018', '\'')
            .replace('\u2019', '\'')
            .replace('\u201c', '"')
            .replace('\u201d', '"')
            .replace('\u00a0', ' ')
            .replaceAll("\\s+", " ")
            .trim();
    }
}
