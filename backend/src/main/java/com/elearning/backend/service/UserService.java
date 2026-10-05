package com.elearning.backend.service;

import com.elearning.backend.dto.RegisterRequest;
import com.elearning.backend.dto.UpdateUserRequest;
import com.elearning.backend.dto.UserResponse;
import com.elearning.backend.model.*;
import com.elearning.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final VideoRepository videoRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        return UserResponse.fromEntity(user);
    }

    public UserResponse createUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email deja utilise");
        }

        User.Role role;
        try {
            role = User.Role.valueOf(
                    request.getRole() != null ? request.getRole().toUpperCase() : "LEARNER"
            );
        } catch (IllegalArgumentException e) {
            role = User.Role.LEARNER;
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        return UserResponse.fromEntity(userRepository.save(user));
    }

    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail());
        }
        if (request.getRole() != null) {
            try {
                user.setRole(User.Role.valueOf(request.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Role invalide");
            }
        }

        return UserResponse.fromEntity(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        // 1. Supprimer les messages chat de l'utilisateur
        chatMessageRepository.deleteAll(
                chatMessageRepository.findByUserOrderByTimestampAsc(user));

        // 2. Supprimer les enrollments de l'utilisateur
        enrollmentRepository.deleteAll(enrollmentRepository.findByUser(user));

        // 3. Si instructeur
        if (user.getRole() == User.Role.INSTRUCTOR) {
            List<Course> courses = courseRepository.findByInstructor(user);
            for (Course course : courses) {
                // 3a. Supprimer les enrollments liés à chaque cours
                enrollmentRepository.deleteAll(enrollmentRepository.findByCourse(course));
                // 3b. Supprimer les vidéos du cours
                videoRepository.deleteAll(
                        videoRepository.findByCourseOrderByOrderIndexAsc(course));
                // 3c. Mettre instructor_id à null avant suppression
                course.setInstructor(null);
                courseRepository.save(course);
            }
            // 3d. Supprimer les cours
            courseRepository.deleteAll(courses);
        }

        // 4. Si learner, vérifier s'il a des cours comme instructeur (sécurité)
        // Mettre à null les références instructor sur les cours restants
        List<Course> remainingCourses = courseRepository.findByInstructor(user);
        for (Course course : remainingCourses) {
            enrollmentRepository.deleteAll(enrollmentRepository.findByCourse(course));
            videoRepository.deleteAll(
                    videoRepository.findByCourseOrderByOrderIndexAsc(course));
            course.setInstructor(null);
            courseRepository.save(course);
        }
        courseRepository.deleteAll(remainingCourses);

        // 5. Supprimer l'utilisateur
        userRepository.delete(user);
    }
}