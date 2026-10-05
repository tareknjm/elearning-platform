package com.elearning.backend.service;

import com.elearning.backend.model.*;
import com.elearning.backend.repository.*;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final QuizService quizService;

    public byte[] generateCertificate(Long courseId, String userEmail) throws Exception {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));
        if (!quizService.hasPassed(courseId, userEmail))
            throw new RuntimeException("Vous devez réussir le quiz pour obtenir le certificat");

        int score = quizService.getLastScore(courseId, userEmail); // à ajouter si pas dispo
        return buildPdf(user, course, score);
    }

    private byte[] buildPdf(User user, Course course, int scorePercent) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Rectangle pageSize = PageSize.A4.rotate();
        float W = pageSize.getWidth();   // 841.89
        float H = pageSize.getHeight();  // 595.28

        Document document = new Document(pageSize, 0, 0, 0, 0);
        PdfWriter writer = PdfWriter.getInstance(document, out);
        document.open();

        PdfContentByte cb = writer.getDirectContent();
        BaseFont serif     = BaseFont.createFont(BaseFont.TIMES_ROMAN,  BaseFont.CP1252, false);
        BaseFont serifBold = BaseFont.createFont(BaseFont.TIMES_BOLD,   BaseFont.CP1252, false);
        BaseFont serifItal = BaseFont.createFont(BaseFont.TIMES_ITALIC, BaseFont.CP1252, false);
        BaseFont serifBI   = BaseFont.createFont(BaseFont.TIMES_BOLDITALIC, BaseFont.CP1252, false);

        // ── Couleurs ──
        BaseColor ivory      = new BaseColor(253, 250, 243);
        BaseColor navyDark   = new BaseColor(30, 27, 75);
        BaseColor violet     = new BaseColor(79, 70, 229);
        BaseColor gold       = new BaseColor(184, 151, 42);
        BaseColor goldLight  = new BaseColor(245, 208, 96);
        BaseColor grayLight  = new BaseColor(107, 114, 128);
        BaseColor grayBorder = new BaseColor(229, 231, 235);
        BaseColor green      = new BaseColor(16, 185, 129);

        // ── Fond ivoire ──
        cb.setColorFill(ivory);
        cb.rectangle(0, 0, W, H);
        cb.fill();

        // ── Motif pointillé décoratif ──
        cb.setColorFill(gold);
        for (float x = 15; x < W; x += 20) {
            for (float y = 15; y < H; y += 20) {
                cb.circle(x, y, 0.7f);
                cb.fill();
            }
        }

        // ── Bordure extérieure violet foncé ──
        cb.setColorStroke(navyDark);
        cb.setLineWidth(5f);
        cb.rectangle(10, 10, W - 20, H - 20);
        cb.stroke();

        // ── Bordure intérieure dorée double ──
        cb.setColorStroke(gold);
        cb.setLineWidth(1.5f);
        cb.rectangle(20, 20, W - 40, H - 40);
        cb.stroke();
        cb.setLineWidth(0.5f);
        cb.rectangle(24, 24, W - 48, H - 48);
        cb.stroke();

        // ── Coins ornementaux ──
        float[][] corners = {{20,H-20},{W-20,H-20},{20,20},{W-20,20}};
        float[][] dirs    = {{1,-1},{-1,-1},{1,1},{-1,1}};
        for (int i = 0; i < 4; i++) {
            float cx = corners[i][0], cy = corners[i][1];
            float dx = dirs[i][0],    dy = dirs[i][1];
            cb.setColorStroke(gold);
            cb.setLineWidth(1.2f);
            cb.moveTo(cx, cy + dy*40);
            cb.lineTo(cx, cy);
            cb.lineTo(cx + dx*40, cy);
            cb.stroke();
            cb.setColorFill(gold);
            cb.circle(cx, cy, 4f);
            cb.fill();
            cb.circle(cx + dx*40, cy, 2f);
            cb.fill();
            cb.circle(cx, cy + dy*40, 2f);
            cb.fill();
        }

        float cx = W / 2f;

        // ── Médaillon ──
        cb.setColorFill(navyDark);
        cb.circle(cx, H - 62, 28);
        cb.fill();
        cb.setColorStroke(gold);
        cb.setLineWidth(1.5f);
        cb.circle(cx, H - 62, 23);
        cb.stroke();
        cb.setColorFill(violet);
        cb.circle(cx, H - 62, 18);
        cb.fill();
        drawStar(cb, cx, H - 62, 10f, goldLight);

        // ── Institution ──
        cb.beginText();
        cb.setFontAndSize(serifItal, 9);
        cb.setColorFill(grayLight);
        cb.setCharacterSpacing(2.5f);
        cb.showTextAligned(PdfContentByte.ALIGN_CENTER, "E-LEARN PLATFORM", cx, H - 110, 0);
        cb.endText();

        // ── Lignes dorées encadrant l'institution ──
        drawOrnamentalLine(cb, cx, H - 116, gold, 90f);

        // ── TITRE PRINCIPAL ──
        cb.beginText();
        cb.setFontAndSize(serifBold, 26);
        cb.setColorFill(navyDark);
        cb.setCharacterSpacing(3f);
        cb.showTextAligned(PdfContentByte.ALIGN_CENTER, "CERTIFICAT DE R\u00c9USSITE", cx, H - 152, 0);
        cb.endText();

        // ── Ligne dorée ornementale sous titre ──
        drawOrnamentalLine(cb, cx, H - 162, gold, 120f);

        // ── "décerné à" ──
        cb.beginText();
        cb.setFontAndSize(serifItal, 12);
        cb.setColorFill(grayLight);
        cb.showTextAligned(PdfContentByte.ALIGN_CENTER, "Ce certificat est d\u00e9cern\u00e9 \u00e0", cx, H - 192, 0);
        cb.endText();

        // ── NOM DU LEARNER ──
        cb.beginText();
        cb.setFontAndSize(serifBI, 32);
        cb.setColorFill(violet);
        cb.showTextAligned(PdfContentByte.ALIGN_CENTER, user.getName(), cx, H - 230, 0);
        cb.endText();

        // ── Ligne pointillée sous le nom ──
        cb.setColorStroke(violet);
        cb.setLineWidth(0.8f);
        cb.setLineDash(4f, 3f, 0f);
        cb.moveTo(cx - 180, H - 240);
        cb.lineTo(cx + 180, H - 240);
        cb.stroke();
        cb.setLineDash(0f);

        // ── "pour avoir complété" ──
        cb.beginText();
        cb.setFontAndSize(serifItal, 12);
        cb.setColorFill(grayLight);
        cb.showTextAligned(PdfContentByte.ALIGN_CENTER,
                "pour avoir compl\u00e9t\u00e9 avec succ\u00e8s la formation", cx, H - 264, 0);
        cb.endText();

        // ── TITRE DU COURS ──
        String title = course.getTitle().length() > 52
                ? course.getTitle().substring(0, 49) + "..." : course.getTitle();
        cb.beginText();
        cb.setFontAndSize(serifBold, 19);
        cb.setColorFill(navyDark);
        cb.showTextAligned(PdfContentByte.ALIGN_CENTER, title, cx, H - 294, 0);
        cb.endText();

        // ── Instructeur ──
        cb.beginText();
        cb.setFontAndSize(serifItal, 11);
        cb.setColorFill(grayLight);
        cb.showTextAligned(PdfContentByte.ALIGN_CENTER,
                "Dispens\u00e9e par " + course.getInstructor().getName(), cx, H - 316, 0);
        cb.endText();

        // ── Séparateur ornemental ──
        drawDotSeparator(cb, cx, H - 333, gold);

        // ── Blocs info : SCORE | N° CERTIFICAT | DATE ──
        String certNum = "EL-" + LocalDate.now().getYear() + "-"
                + String.format("%06d", Math.abs(UUID.randomUUID().hashCode() % 1000000));
        String date = LocalDate.now()
                .format(DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.FRENCH));

        drawInfoBox(cb, serif, serifBold, cx - 170, H - 395, 130, 52,
                "SCORE OBTENU", scorePercent + "%", green, grayBorder, grayLight);
        drawInfoBox(cb, serif, serifBold, cx - 65, H - 395, 130, 52,
                "N\u00b0 CERTIFICAT", certNum, navyDark, grayBorder, grayLight);
        drawInfoBox(cb, serif, serifBold, cx + 40, H - 395, 130, 52,
                "D\u00c9LIVR\u00c9 LE", date, navyDark, grayBorder, grayLight);

        // ── Pied de page ──
        cb.beginText();
        cb.setFontAndSize(serif, 8);
        cb.setColorFill(new BaseColor(156, 163, 175));
        cb.setCharacterSpacing(1.5f);
        cb.showTextAligned(PdfContentByte.ALIGN_CENTER,
                "CE DOCUMENT ATTESTE DE LA R\u00c9USSITE OFFICIELLE DE LA FORMATION  \u2022  E-LEARN PLATFORM",
                cx, 36, 0);
        cb.endText();

        document.close();
        return out.toByteArray();
    }

    private void drawOrnamentalLine(PdfContentByte cb, float cx, float y,
                                    BaseColor color, float halfLen) {
        cb.setColorStroke(color);
        cb.setLineWidth(0.8f);
        cb.moveTo(cx - halfLen, y);
        cb.lineTo(cx - 8, y);
        cb.stroke();
        cb.setColorFill(color);
        cb.circle(cx, y, 3f);
        cb.fill();
        cb.moveTo(cx + 8, y);
        cb.lineTo(cx + halfLen, y);
        cb.stroke();
    }

    private void drawDotSeparator(PdfContentByte cb, float cx, float y, BaseColor color) {
        cb.setColorStroke(color);
        cb.setLineWidth(0.8f);
        cb.moveTo(cx - 90, y);
        cb.lineTo(cx - 18, y);
        cb.stroke();
        cb.setColorFill(color);
        cb.circle(cx - 10, y, 2f); cb.fill();
        cb.circle(cx,       y, 3f); cb.fill();
        cb.circle(cx + 10,  y, 2f); cb.fill();
        cb.moveTo(cx + 18, y);
        cb.lineTo(cx + 90, y);
        cb.stroke();
    }

    private void drawInfoBox(PdfContentByte cb, BaseFont serif, BaseFont serifBold,
                             float x, float y, float w, float h,
                             String label, String value,
                             BaseColor valueColor, BaseColor borderColor, BaseColor labelColor) {
        cb.setColorStroke(borderColor);
        cb.setLineWidth(0.8f);
        cb.roundRectangle(x, y, w, h, 4f);
        cb.stroke();

        cb.beginText();
        cb.setFontAndSize(serif, 8);
        cb.setColorFill(labelColor);
        cb.setCharacterSpacing(1f);
        cb.showTextAligned(PdfContentByte.ALIGN_CENTER, label, x + w/2, y + h - 18, 0);
        cb.endText();

        cb.beginText();
        cb.setFontAndSize(serifBold, label.equals("SCORE OBTENU") ? 20 : 12);
        cb.setColorFill(valueColor);
        cb.showTextAligned(PdfContentByte.ALIGN_CENTER, value, x + w/2, y + 12, 0);
        cb.endText();
    }

    private void drawStar(PdfContentByte cb, float cx, float cy,
                          float r, BaseColor color) {
        cb.setColorFill(color);
        double offset = -Math.PI / 2;
        float inner  = r * 0.42f;
        cb.moveTo(cx + (float)(r * Math.cos(offset)),
                cy + (float)(r * Math.sin(offset)));
        for (int i = 1; i < 10; i++) {
            double angle  = offset + i * Math.PI / 5;
            float  radius = (i % 2 == 0) ? r : inner;
            cb.lineTo(cx + (float)(radius * Math.cos(angle)),
                    cy + (float)(radius * Math.sin(angle)));
        }
        cb.closePath();
        cb.fill();
    }
}