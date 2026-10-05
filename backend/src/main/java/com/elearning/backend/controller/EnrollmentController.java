package com.elearning.backend.controller;

import com.elearning.backend.dto.EnrollmentResponse;
import com.elearning.backend.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/learner")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    // S'inscrire
    @PostMapping("/enroll/{courseId}")
    public ResponseEntity<EnrollmentResponse> enroll(
            @PathVariable Long courseId,
            Authentication authentication) {
        return ResponseEntity.ok(
                enrollmentService.enroll(courseId, authentication.getName()));
    }

    // Mes formations
    @GetMapping("/enrollments")
    public ResponseEntity<List<EnrollmentResponse>> getMyEnrollments(
            Authentication authentication) {
        return ResponseEntity.ok(
                enrollmentService.getMyEnrollments(authentication.getName()));
    }

    // Vérifier si inscrit
    @GetMapping("/enrolled/{courseId}")
    public ResponseEntity<Map<String, Boolean>> isEnrolled(
            @PathVariable Long courseId,
            Authentication authentication) {
        boolean enrolled = enrollmentService.isEnrolled(courseId, authentication.getName());
        return ResponseEntity.ok(Map.of("enrolled", enrolled));
    }

    // Se désinscrire
    @DeleteMapping("/unenroll/{courseId}")
    public ResponseEntity<Void> unenroll(
            @PathVariable Long courseId,
            Authentication authentication) {
        enrollmentService.unenroll(courseId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}