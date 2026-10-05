package com.elearning.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendInterviewEmail(String toEmail, String candidateName,
                                   LocalDateTime interviewDateTime, String meetingRoom) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Entretien planifié — Candidature Instructeur E-Learn");

            // Formatage sans Locale.FRENCH pour éviter les problèmes JVM Windows
            String day = String.valueOf(interviewDateTime.getDayOfMonth());
            String month = switch (interviewDateTime.getMonthValue()) {
                case 1 -> "janvier"; case 2 -> "février"; case 3 -> "mars";
                case 4 -> "avril"; case 5 -> "mai"; case 6 -> "juin";
                case 7 -> "juillet"; case 8 -> "août"; case 9 -> "septembre";
                case 10 -> "octobre"; case 11 -> "novembre"; default -> "décembre";
            };
            String year = String.valueOf(interviewDateTime.getYear());
            String hour = String.format("%02d", interviewDateTime.getHour());
            String minute = String.format("%02d", interviewDateTime.getMinute());
            String formattedDate = day + " " + month + " " + year + " à " + hour + "h" + minute;

            String meetingUrl = "https://meet.jit.si/" + meetingRoom;

            String html = """
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0c29; color: white; border-radius: 16px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #8b5cf6, #6366f1); padding: 32px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 900;">Entretien planifié !</h1>
                    <p style="margin: 8px 0 0; opacity: 0.8; font-size: 15px;">Votre candidature a retenu notre attention</p>
                </div>
                <div style="padding: 32px;">
                    <p style="font-size: 16px; margin-bottom: 24px; color: rgba(255,255,255,0.85);">
                        Bonjour <strong>%s</strong>,<br><br>
                        Nous avons le plaisir de vous informer qu'un entretien vidéo a été planifié pour évaluer votre candidature instructeur.
                    </p>
                    <div style="background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                        <p style="margin: 0 0 12px; font-size: 14px;">
                            <span style="color: #a78bfa; font-weight: 600;">Date et heure :</span><br>
                            <span style="font-size: 17px; font-weight: 700;">%s</span>
                        </p>
                        <p style="margin: 0; font-size: 14px;">
                            <span style="color: #a78bfa; font-weight: 600;">Lien de l'entretien :</span><br>
                            <a href="%s" style="color: #c4b5fd; font-weight: 600;">%s</a>
                        </p>
                    </div>
                    <a href="%s" style="display: block; background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; text-align: center; padding: 16px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; margin-bottom: 24px;">
                        Rejoindre l'entretien
                    </a>
                    <p style="font-size: 13px; color: rgba(255,255,255,0.45); text-align: center;">
                        Durée estimée : 30 minutes. Assurez-vous d'avoir une connexion stable.
                    </p>
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: 16px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.3);">E-Learn Platform</p>
                </div>
            </div>
            """.formatted(candidateName, formattedDate, meetingUrl, meetingUrl, meetingUrl);

            helper.setText(html, true);
            mailSender.send(message);
            System.out.println("Email entretien envoyé à : " + toEmail);

        } catch (Exception e) {
            System.err.println("Erreur envoi email entretien: " + e.getMessage());
            e.printStackTrace();
        }
    }
    public void sendApprovalEmail(String toEmail, String candidateName, String tempPassword) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject("Félicitations ! Votre candidature a été acceptée — E-Learn");

            String html = """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0c29; color: white; border-radius: 16px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 32px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 900;">🎉 Candidature acceptée !</h1>
                    </div>
                    <div style="padding: 32px;">
                        <p style="font-size: 16px; color: rgba(255,255,255,0.85);">
                            Bonjour <strong>%s</strong>,<br><br>
                            Félicitations ! Votre candidature pour devenir instructeur sur <strong>E-Learn</strong> a été <strong style="color: #6ee7b7;">acceptée</strong>.<br><br>
                            Voici vos identifiants de connexion :
                        </p>
                        <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; padding: 20px; margin: 24px 0;">
                            <p style="margin: 0 0 8px; font-size: 14px;"><span style="color: #6ee7b7;">Email :</span> <strong>%s</strong></p>
                            <p style="margin: 0; font-size: 14px;"><span style="color: #6ee7b7;">Mot de passe temporaire :</span> <strong>%s</strong></p>
                        </div>
                        <p style="font-size: 13px; color: rgba(255,255,255,0.45);">Changez votre mot de passe dès votre première connexion.</p>
                    </div>
                </div>
                """.formatted(candidateName, toEmail, tempPassword);

            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Erreur envoi email approbation: " + e.getMessage());
        }
    }

    public void sendRejectionEmail(String toEmail, String candidateName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject("Résultat de votre candidature — E-Learn");

            String html = """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0c29; color: white; border-radius: 16px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 32px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: 900;">Résultat de candidature</h1>
                    </div>
                    <div style="padding: 32px;">
                        <p style="font-size: 16px; color: rgba(255,255,255,0.85);">
                            Bonjour <strong>%s</strong>,<br><br>
                            Après examen de votre candidature et entretien, nous ne sommes malheureusement pas en mesure de donner une suite favorable à votre candidature pour le moment.<br><br>
                            Nous vous encourageons à postuler de nouveau dans 6 mois avec de nouvelles réalisations.
                        </p>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 16px; text-align: center;">
                        <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.3);">E-Learn Platform</p>
                    </div>
                </div>
                """.formatted(candidateName);

            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Erreur envoi email rejet: " + e.getMessage());
        }
    }

    public void sendVideoCallConfirmationEmail(String toEmail, String learnerName,
                                               String instructorName, String courseTitle,
                                               LocalDateTime scheduledAt, int durationMinutes,
                                               double amountPaid, String jitsiRoom) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject("Votre appel 1-on-1 est confirmé — E-Learn");

            String day = String.valueOf(scheduledAt.getDayOfMonth());
            String month = switch (scheduledAt.getMonthValue()) {
                case 1 -> "janvier"; case 2 -> "février"; case 3 -> "mars";
                case 4 -> "avril"; case 5 -> "mai"; case 6 -> "juin";
                case 7 -> "juillet"; case 8 -> "août"; case 9 -> "septembre";
                case 10 -> "octobre"; case 11 -> "novembre"; default -> "décembre";
            };
            String year = String.valueOf(scheduledAt.getYear());
            String hour = String.format("%02d", scheduledAt.getHour());
            String minute = String.format("%02d", scheduledAt.getMinute());
            String formattedDate = day + " " + month + " " + year + " à " + hour + "h" + minute;

            String meetingUrl = "https://meet.jit.si/" + jitsiRoom;
            String formattedAmount = String.format("%.2f", amountPaid);

            String html = """
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0c29; color: white; border-radius: 16px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #8b5cf6, #6366f1); padding: 32px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 900;">Appel 1-on-1 confirmé !</h1>
                    <p style="margin: 8px 0 0; opacity: 0.8; font-size: 15px;">Votre réservation a bien été enregistrée</p>
                </div>
                <div style="padding: 32px;">
                    <p style="font-size: 16px; margin-bottom: 24px; color: rgba(255,255,255,0.85);">
                        Bonjour <strong>%s</strong>,<br><br>
                        Votre appel vidéo privé avec <strong>%s</strong> pour la formation <strong>%s</strong> est confirmé.
                    </p>
                    <div style="background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                        <p style="margin: 0 0 12px; font-size: 14px;">
                            <span style="color: #a78bfa; font-weight: 600;">Date et heure :</span><br>
                            <span style="font-size: 17px; font-weight: 700;">%s</span>
                        </p>
                        <p style="margin: 0 0 12px; font-size: 14px;">
                            <span style="color: #a78bfa; font-weight: 600;">Durée :</span><br>
                            <span style="font-size: 15px; font-weight: 600;">%d minutes</span>
                        </p>
                        <p style="margin: 0 0 12px; font-size: 14px;">
                            <span style="color: #a78bfa; font-weight: 600;">Montant payé :</span><br>
                            <span style="font-size: 15px; font-weight: 600;">%s €</span>
                        </p>
                        <p style="margin: 0; font-size: 14px;">
                            <span style="color: #a78bfa; font-weight: 600;">Lien de l'appel :</span><br>
                            <a href="%s" style="color: #c4b5fd; font-weight: 600;">%s</a>
                        </p>
                    </div>
                    <a href="%s" style="display: block; background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; text-align: center; padding: 16px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; margin-bottom: 24px;">
                        Rejoindre l'appel
                    </a>
                    <p style="font-size: 13px; color: rgba(255,255,255,0.45); text-align: center;">
                        Vous pouvez retrouver ce lien à tout moment dans votre espace « Mes appels vidéo ».
                    </p>
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: 16px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.3);">E-Learn Platform</p>
                </div>
            </div>
            """.formatted(learnerName, instructorName, courseTitle, formattedDate,
                    durationMinutes, formattedAmount, meetingUrl, meetingUrl, meetingUrl);

            helper.setText(html, true);
            mailSender.send(message);
            System.out.println("Email confirmation appel vidéo envoyé à : " + toEmail);

        } catch (Exception e) {
            System.err.println("Erreur envoi email confirmation appel vidéo: " + e.getMessage());
            e.printStackTrace();
        }
    }
    public void sendPasswordResetEmail(String toEmail, String userName, String newPassword) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject("Réinitialisation de votre mot de passe — E-Learn");

            String html = """
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0c29; color: white; border-radius: 16px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #8b5cf6, #6366f1); padding: 32px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 900;">🔐 Nouveau mot de passe</h1>
                    <p style="margin: 8px 0 0; opacity: 0.8; font-size: 15px;">Votre demande de réinitialisation a été traitée</p>
                </div>
                <div style="padding: 32px;">
                    <p style="font-size: 16px; margin-bottom: 24px; color: rgba(255,255,255,0.85);">
                        Bonjour <strong>%s</strong>,<br><br>
                        Voici votre nouveau mot de passe temporaire. Connectez-vous et changez-le dès que possible.
                    </p>
                    <div style="background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
                        <p style="margin: 0 0 8px; font-size: 13px; color: #a78bfa; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;">Mot de passe temporaire</p>
                        <p style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 0.15em; color: white; font-family: monospace;">%s</p>
                    </div>
                    <a href="http://localhost:5173/login" style="display: block; background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; text-align: center; padding: 16px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; margin-bottom: 24px;">
                        Se connecter maintenant
                    </a>
                    <p style="font-size: 13px; color: rgba(255,255,255,0.35); text-align: center;">
                        Si vous n'êtes pas à l'origine de cette demande, ignorez cet email. Votre ancien mot de passe reste actif.
                    </p>
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: 16px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.3);">E-Learn Platform</p>
                </div>
            </div>
            """.formatted(userName, newPassword);

            helper.setText(html, true);
            mailSender.send(message);
            System.out.println("Email réinitialisation envoyé à : " + toEmail);
        } catch (Exception e) {
            System.err.println("Erreur envoi email reset: " + e.getMessage());
            e.printStackTrace();
        }
    }
}