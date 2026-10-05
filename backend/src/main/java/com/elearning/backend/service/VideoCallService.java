package com.elearning.backend.service;

import com.elearning.backend.model.*;
import com.elearning.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VideoCallService {

    private static final double PRICE_PER_MINUTE = 0.5;

    private final VideoCallBookingRepository bookingRepo;
    private final InstructorAvailabilityRepository availabilityRepo;
    private final AbsenceJustificationRepository justificationRepo;
    private final InstructorPenaltyRepository penaltyRepo;
    private final UserRepository userRepo;
    private final CourseRepository courseRepo;
    private final NotificationService notificationService;
    private final EmailService emailService;

    // ── INSTRUCTEUR : sauvegarder ses disponibilités ──
    @Transactional
    public void saveAvailabilities(String instructorEmail, List<Map<String, Object>> slots) {
        User instructor = getUser(instructorEmail);

        // Vérifier si une modification a déjà été faite cette semaine
        if (instructor.getAvailabilityLastUpdated() != null) {
            LocalDateTime lastUpdate = instructor.getAvailabilityLastUpdated();
            // Début de la semaine courante (lundi 00:00)
            LocalDateTime startOfWeek = LocalDate.now()
                    .with(java.time.DayOfWeek.MONDAY)
                    .atStartOfDay();
            if (lastUpdate.isAfter(startOfWeek)) {
                throw new RuntimeException("WEEKLY_LIMIT_REACHED");
            }
        }

        availabilityRepo.deleteByInstructor(instructor);

        List<InstructorAvailability> saved = slots.stream().map(slot -> {
            InstructorAvailability av = new InstructorAvailability();
            av.setInstructor(instructor);
            av.setDayOfWeek(DayOfWeek.valueOf((String) slot.get("dayOfWeek")));
            av.setStartHour((int) slot.get("startHour"));
            av.setDurationMinutes((int) slot.get("durationMinutes"));
            return av;
        }).collect(Collectors.toList());

        availabilityRepo.saveAll(saved);

        // Enregistrer la date de modification
        instructor.setAvailabilityLastUpdated(LocalDateTime.now());
        userRepo.save(instructor);
    }

    // ── LEARNER : voir les créneaux disponibles d'un instructeur ──
    public List<Map<String, Object>> getAvailableSlots(Long instructorId, Long courseId) {
        User instructor = userRepo.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("Instructeur introuvable"));

        List<InstructorAvailability> availabilities =
                availabilityRepo.findByInstructorAndActiveTrue(instructor);

        List<Map<String, Object>> result = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // Générer les créneaux pour les 14 prochains jours
        for (int d = 1; d <= 14; d++) {
            LocalDate date = today.plusDays(d);
            DayOfWeek dow = date.getDayOfWeek();

            availabilities.stream()
                    .filter(av -> av.getDayOfWeek() == dow)
                    .forEach(av -> {
                        LocalDateTime start = LocalDateTime.of(date,
                                LocalTime.of(av.getStartHour(), 0));
                        LocalDateTime end = start.plusMinutes(av.getDurationMinutes());

                        // Vérifier qu'il n'y a pas de conflit
                        List<VideoCallBooking> conflicts =
                                bookingRepo.findConflicts(instructor, start, end);

                        if (conflicts.isEmpty()) {
                            Map<String, Object> slot = new HashMap<>();
                            slot.put("date", date.toString());
                            slot.put("startHour", av.getStartHour());
                            slot.put("durationMinutes", av.getDurationMinutes());
                            slot.put("price", av.getDurationMinutes() * PRICE_PER_MINUTE);
                            slot.put("availabilityId", av.getId());
                            result.add(slot);
                        }
                    });
        }

        return result;
    }

    // ── LEARNER : réserver un appel ──
    @Transactional
    public VideoCallBooking bookCall(String learnerEmail, Long courseId,
                                     Long instructorId, LocalDateTime scheduledAt,
                                     int durationMinutes) {
        User learner = getUser(learnerEmail);
        if (!learner.isPremium()) throw new RuntimeException("PREMIUM_REQUIRED");

        User instructor = userRepo.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("Instructeur introuvable"));
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));

        // Vérifier disponibilité
        LocalDateTime end = scheduledAt.plusMinutes(durationMinutes);
        List<VideoCallBooking> conflicts = bookingRepo.findConflicts(instructor, scheduledAt, end);
        if (!conflicts.isEmpty()) throw new RuntimeException("Ce créneau n'est plus disponible");

        double amount = durationMinutes * PRICE_PER_MINUTE;
        String room = "elearn-call-" + UUID.randomUUID().toString().substring(0, 10);

        VideoCallBooking booking = VideoCallBooking.builder()
                .learner(learner)
                .instructor(instructor)
                .course(course)
                .scheduledAt(scheduledAt)
                .durationMinutes(durationMinutes)
                .amountPaid(amount)
                .jitsiRoom(room)
                .build();

        bookingRepo.save(booking);

        // Notifications
        notificationService.send(instructor,
                "Nouvel appel vidéo réservé",
                learner.getName() + " a réservé un appel le " + scheduledAt.toLocalDate(),
                "VIDEO_CALL", "/instructor/video-calls");

        notificationService.send(learner,
                "Réservation confirmée",
                "Votre appel avec " + instructor.getName() + " est confirmé",
                "VIDEO_CALL", "/learner/video-calls");

        emailService.sendVideoCallConfirmationEmail(
                learner.getEmail(), learner.getName(),
                instructor.getName(), course.getTitle(),
                scheduledAt, durationMinutes, amount, room);

        return booking;
    }
    public Map<String, Object> getAvailabilityStatus(String instructorEmail) {
        User instructor = getUser(instructorEmail);
        LocalDateTime startOfWeek = LocalDate.now()
                .with(java.time.DayOfWeek.MONDAY)
                .atStartOfDay();

        Map<String, Object> status = new HashMap<>();
        boolean canEdit = instructor.getAvailabilityLastUpdated() == null
                || instructor.getAvailabilityLastUpdated().isBefore(startOfWeek);
        status.put("canEdit", canEdit);
        status.put("lastUpdated", instructor.getAvailabilityLastUpdated());
        // Prochain lundi = prochaine semaine où il pourra modifier
        LocalDateTime nextMonday = LocalDate.now()
                .with(java.time.temporal.TemporalAdjusters.next(java.time.DayOfWeek.MONDAY))
                .atStartOfDay();
        status.put("nextEditDate", nextMonday);
        return status;
    }
    // ── INSTRUCTEUR : uploader un certificat d'absence ──
    @Transactional
    public AbsenceJustification submitJustification(String instructorEmail,
                                                    Long bookingId,
                                                    String certificateUrl,
                                                    String reason) {
        User instructor = getUser(instructorEmail);
        VideoCallBooking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Réservation introuvable"));

        if (!booking.getInstructor().getId().equals(instructor.getId()))
            throw new RuntimeException("Non autorisé");

        AbsenceJustification justification = AbsenceJustification.builder()
                .instructor(instructor)
                .booking(booking)
                .certificateUrl(certificateUrl)
                .reason(reason)
                .build();

        AbsenceJustification saved = justificationRepo.save(justification);

        // Notifier l'admin
        userRepo.findAll().stream()
                .filter(u -> u.getRole() == User.Role.ADMIN)
                .forEach(admin -> notificationService.send(admin,
                        "Justificatif d'absence soumis",
                        instructor.getName() + " a soumis un certificat médical",
                        "ABSENCE", "/admin/absences"));

        return saved;
    }

    // ── ADMIN : approuver ou rejeter un justificatif ──
    @Transactional
    public AbsenceJustification reviewJustification(Long justificationId,
                                                    String decision,
                                                    String adminNote) {
        AbsenceJustification just = justificationRepo.findById(justificationId)
                .orElseThrow(() -> new RuntimeException("Justificatif introuvable"));

        just.setAdminNote(adminNote);
        just.setReviewedAt(LocalDateTime.now());

        if ("APPROVE".equals(decision)) {
            just.setStatus(AbsenceJustification.JustificationStatus.APPROVED);
            // Annuler l'amende si elle existe
            penaltyRepo.findByBookingId(just.getBooking().getId())
                    .ifPresent(p -> {
                        p.setStatus(InstructorPenalty.PenaltyStatus.WAIVED);
                        penaltyRepo.save(p);
                    });
            notificationService.send(just.getInstructor(),
                    "Justificatif approuvé",
                    "Votre certificat médical a été validé par l'administration",
                    "ABSENCE", "/instructor/absences");
        } else {
            just.setStatus(AbsenceJustification.JustificationStatus.REJECTED);
            // Créer ou maintenir l'amende
            if (penaltyRepo.findByBookingId(just.getBooking().getId()).isEmpty()) {
                createPenalty(just.getInstructor(), just.getBooking(), "Justificatif rejeté");
            }
            notificationService.send(just.getInstructor(),
                    "Justificatif rejeté",
                    "Votre certificat médical a été rejeté. Une amende a été appliquée.",
                    "ABSENCE", "/instructor/absences");
        }

        return justificationRepo.save(just);
    }

    // ── SCHEDULED : détecter les absences non justifiées après 48h ──
    @Scheduled(cron = "0 0 * * * *") // toutes les heures
    @Transactional
    public void checkUnjustifiedAbsences() {
        LocalDateTime deadline = LocalDateTime.now().minusHours(48);
        List<VideoCallBooking> absences = bookingRepo.findUnjustifiedAbsences(deadline);

        absences.forEach(booking -> {
            boolean alreadyJustified = justificationRepo
                    .findByBookingId(booking.getId()).isPresent();
            boolean alreadyPenalized = penaltyRepo
                    .findByBookingId(booking.getId()).isPresent();

            if (!alreadyJustified && !alreadyPenalized) {
                createPenalty(booking.getInstructor(), booking,
                        "Absence non justifiée sous 48h");
                notificationService.send(booking.getInstructor(),
                        "Amende appliquée",
                        "Vous n'avez pas justifié votre absence sous 48h. Une amende de 30€ a été émise.",
                        "PENALTY", "/instructor/penalties");
            }
        });
    }

    private void createPenalty(User instructor, VideoCallBooking booking, String reason) {
        InstructorPenalty penalty = InstructorPenalty.builder()
                .instructor(instructor)
                .booking(booking)
                .amount(30.0)
                .reason(reason)
                .build();
        penaltyRepo.save(penalty);
    }

    private User getUser(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
    }

    // ── Getters pour controllers ──
    public List<VideoCallBooking> getMyCallsAsLearner(String email) {
        return bookingRepo.findByLearnerOrderByScheduledAtDesc(getUser(email));
    }

    public List<VideoCallBooking> getMyCallsAsInstructor(String email) {
        return bookingRepo.findByInstructorOrderByScheduledAtDesc(getUser(email));
    }

    public List<AbsenceJustification> getAllPendingJustifications() {
        return justificationRepo.findByStatusOrderBySubmittedAtDesc(
                AbsenceJustification.JustificationStatus.PENDING);
    }

    public List<InstructorPenalty> getAllPenalties() {
        return penaltyRepo.findByStatusOrderByIssuedAtDesc(
                InstructorPenalty.PenaltyStatus.PENDING);
    }

    public List<InstructorAvailability> getAvailabilities(String instructorEmail) {
        User instructor = getUser(instructorEmail);
        return availabilityRepo.findByInstructorAndActiveTrue(instructor);
    }
    public VideoCallBooking getBookingForUser(Long bookingId, String userEmail) {
        User user = getUser(userEmail);
        VideoCallBooking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Réservation introuvable"));

        boolean isLearner = booking.getLearner().getId().equals(user.getId());
        boolean isInstructor = booking.getInstructor().getId().equals(user.getId());
        if (!isLearner && !isInstructor) throw new RuntimeException("Non autorisé");

        return booking;
    }

    @Transactional
    public VideoCallBooking markJoined(Long bookingId, String userEmail) {
        User user = getUser(userEmail);
        VideoCallBooking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Réservation introuvable"));

        if (booking.getLearner().getId().equals(user.getId())) {
            booking.setLearnerJoined(true);
        } else if (booking.getInstructor().getId().equals(user.getId())) {
            booking.setInstructorJoined(true);
        } else {
            throw new RuntimeException("Non autorisé");
        }

        return bookingRepo.save(booking);
    }

    @Transactional
    public VideoCallBooking markLeft(Long bookingId, String userEmail) {
        User user = getUser(userEmail);
        VideoCallBooking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Réservation introuvable"));

        if (booking.getStatus() != VideoCallBooking.BookingStatus.CONFIRMED) {
            return booking; // déjà traité (COMPLETED/ABSENT), on ne touche plus
        }

        boolean callEnded = LocalDateTime.now()
                .isAfter(booking.getScheduledAt().plusMinutes(booking.getDurationMinutes()).minusMinutes(2));

        if (booking.isInstructorJoined() && booking.isLearnerJoined()) {
            booking.setStatus(VideoCallBooking.BookingStatus.COMPLETED);
        } else if (callEnded) {
            // Le créneau est passé et l'un des deux n'est jamais venu
            booking.setStatus(VideoCallBooking.BookingStatus.ABSENT);
            User absentParty = booking.isLearnerJoined() ? booking.getInstructor() : null;
            if (absentParty != null) {
                notificationService.send(absentParty,
                        "Absence détectée",
                        "Vous n'avez pas rejoint votre appel vidéo prévu. Vous avez 48h pour justifier.",
                        "ABSENCE", "/instructor/absences");
            }
        }
        // sinon : rien à faire, l'autre partie peut encore arriver

        return bookingRepo.save(booking);
    }
    public List<AbsenceJustification> getAllJustifications() {
        return justificationRepo.findAll(
                org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Direction.DESC, "submittedAt"));
    }
}