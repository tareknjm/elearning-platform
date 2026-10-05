package com.elearning.backend.service;

import com.elearning.backend.dto.EnrollmentResponse;
import com.elearning.backend.model.*;
import com.elearning.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final NotificationService notificationService;

    public EnrollmentResponse enroll(Long courseId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));

        if (course.getStatus() != Course.Status.APPROVED) {
            throw new RuntimeException("Cette formation n'est pas disponible");
        }

        if (enrollmentRepository.existsByUserAndCourse(user, course)) {
            throw new RuntimeException("Vous etes deja inscrit a cette formation");
        }

        final int FREE_ENROLLMENT_LIMIT = 3;
        if (!user.isPremium()) {
            long currentCount = enrollmentRepository.findByUser(user).size();
            if (currentCount >= FREE_ENROLLMENT_LIMIT) {
                throw new RuntimeException("LIMIT_REACHED");
            }
        }

        Enrollment enrollment = Enrollment.builder()
                .user(user)
                .course(course)
                .build();

        enrollmentRepository.save(enrollment);

        if (course.getInstructor() != null) {
            notificationService.send(
                    course.getInstructor(),
                    "Nouvel inscrit !",
                    user.getName() + " s'est inscrit à votre formation \""
                            + course.getTitle() + "\"",
                    "ENROLLMENT",
                    "/instructor/analytics"
            );
        }

        return EnrollmentResponse.fromEntity(enrollment);
    }

    public List<EnrollmentResponse> getMyEnrollments(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        return enrollmentRepository.findByUser(user)
                .stream()
                .map(EnrollmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public boolean isEnrolled(Long courseId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));
        return enrollmentRepository.existsByUserAndCourse(user, course);
    }

    public void unenroll(Long courseId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));
        Enrollment enrollment = enrollmentRepository.findByUser(user)
                .stream()
                .filter(e -> e.getCourse().getId().equals(courseId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Inscription introuvable"));
        enrollmentRepository.delete(enrollment);
    }
}