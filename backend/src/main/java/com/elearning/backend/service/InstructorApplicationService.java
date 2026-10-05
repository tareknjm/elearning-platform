package com.elearning.backend.service;

import com.elearning.backend.dto.*;
import com.elearning.backend.model.*;
import com.elearning.backend.repository.*;
import java.nio.file.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InstructorApplicationService {

    private final InstructorApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public InstructorApplicationResponse apply(InstructorApplicationRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            throw new RuntimeException("Un compte existe déjà avec cet email");
        if (applicationRepository.existsByEmail(request.getEmail()))
            throw new RuntimeException("Une candidature existe déjà avec cet email");

        String filePath = null;
        if (request.getMotivationFile() != null && !request.getMotivationFile().isEmpty()) {
            try {
                String fileName = System.currentTimeMillis() + "_" +
                        request.getMotivationFile().getOriginalFilename();
                Path uploadDir = Paths.get("uploads/motivations");
                Files.createDirectories(uploadDir);
                Path dest = uploadDir.resolve(fileName);
                Files.copy(request.getMotivationFile().getInputStream(), dest,
                        StandardCopyOption.REPLACE_EXISTING);
                filePath = dest.toString();
            } catch (Exception e) {
                throw new RuntimeException("Erreur upload fichier : " + e.getMessage());
            }
        }

        InstructorApplication application = InstructorApplication.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .speciality(request.getSpeciality())
                .experience(request.getExperience())
                .motivation(request.getMotivation())
                .linkedinUrl(request.getLinkedinUrl())
                .educationLevel(request.getEducationLevel())
                .motivationFilePath(filePath)
                .build();

        InstructorApplication saved = applicationRepository.save(application);

        userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.ADMIN)
                .forEach(admin -> notificationService.send(
                        admin,
                        "Nouvelle candidature instructeur",
                        request.getFullName() + " a soumis une candidature pour devenir instructeur.",
                        "NEW_APPLICATION"
                ));

        return InstructorApplicationResponse.fromEntity(saved);
    }

    public List<InstructorApplicationResponse> getAllApplications(boolean archived) {
        return applicationRepository.findAllByOrderByAppliedAtDesc()
                .stream()
                .filter(a -> a.isArchived() == archived)
                .map(InstructorApplicationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<InstructorApplicationResponse> getByStatus(InstructorApplication.Status status) {
        return applicationRepository.findByStatusOrderByAppliedAtDesc(status)
                .stream()
                .filter(a -> !a.isArchived())
                .map(InstructorApplicationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public InstructorApplicationResponse getById(Long id) {
        return InstructorApplicationResponse.fromEntity(
                applicationRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Candidature introuvable")));
    }

    @Transactional
    public InstructorApplicationResponse scheduleInterview(Long id,
                                                           ScheduleInterviewRequest request) {
        InstructorApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidature introuvable"));

        String roomName = "elearn-interview-" + UUID.randomUUID().toString().substring(0, 8);
        application.setStatus(InstructorApplication.Status.INTERVIEW_SCHEDULED);
        application.setInterviewScheduledAt(request.getInterviewDateTime());
        application.setMeetingRoom(roomName);

        InstructorApplication saved = applicationRepository.save(application);

        // Envoi email automatique
        emailService.sendInterviewEmail(
                application.getEmail(),
                application.getFullName(),
                request.getInterviewDateTime(),
                roomName
        );

        return InstructorApplicationResponse.fromEntity(saved);
    }

    @Transactional
    public InstructorApplicationResponse review(Long id, ReviewApplicationRequest request) {
        InstructorApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidature introuvable"));

        application.setAdminNote(request.getAdminNote());
        application.setReviewedAt(LocalDateTime.now());

        if ("APPROVE".equals(request.getDecision())) {
            application.setStatus(InstructorApplication.Status.APPROVED);

            String password = (request.getTemporaryPassword() != null
                    && !request.getTemporaryPassword().isBlank())
                    ? request.getTemporaryPassword() : "Instructor@2026";

            User instructor = User.builder()
                    .name(application.getFullName())
                    .email(application.getEmail())
                    .password(passwordEncoder.encode(password))
                    .role(User.Role.INSTRUCTOR)
                    .build();

            userRepository.save(instructor);

            // Email d'approbation avec identifiants
            emailService.sendApprovalEmail(application.getEmail(),
                    application.getFullName(), password);

        } else {
            application.setStatus(InstructorApplication.Status.REJECTED);
            emailService.sendRejectionEmail(application.getEmail(), application.getFullName());
        }

        return InstructorApplicationResponse.fromEntity(applicationRepository.save(application));
    }

    public InstructorApplicationResponse archiveApplication(Long id) {
        InstructorApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidature introuvable"));
        application.setArchived(true);
        application.setArchivedAt(LocalDateTime.now());
        return InstructorApplicationResponse.fromEntity(applicationRepository.save(application));
    }

    public InstructorApplicationResponse restoreApplication(Long id) {
        InstructorApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidature introuvable"));
        application.setArchived(false);
        application.setArchivedAt(null);
        return InstructorApplicationResponse.fromEntity(applicationRepository.save(application));
    }

    public long countPending() {
        return applicationRepository
                .findByStatusOrderByAppliedAtDesc(InstructorApplication.Status.PENDING)
                .stream().filter(a -> !a.isArchived()).count();
    }
}