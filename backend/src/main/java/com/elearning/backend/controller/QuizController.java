package com.elearning.backend.controller;

import com.elearning.backend.dto.*;
import com.elearning.backend.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PostMapping("/instructor/quiz")
    public ResponseEntity<QuizResponse> createQuiz(@RequestBody QuizRequest request) {
        return ResponseEntity.ok(quizService.createQuiz(request));
    }

    @GetMapping("/courses/{courseId}/quiz")
    public ResponseEntity<QuizResponse> getQuiz(@PathVariable Long courseId) {
        return ResponseEntity.ok(quizService.getQuizByCourse(courseId));
    }

    @PostMapping("/learner/quiz/{quizId}/submit")
    public ResponseEntity<QuizResultResponse> submitQuiz(
            @PathVariable Long quizId,
            @RequestBody QuizSubmitRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                quizService.submitQuiz(quizId, request, authentication.getName()));
    }

    @GetMapping("/learner/courses/{courseId}/passed")
    public ResponseEntity<Map<String, Boolean>> hasPassed(
            @PathVariable Long courseId,
            Authentication authentication) {
        boolean passed = quizService.hasPassed(courseId, authentication.getName());
        return ResponseEntity.ok(Map.of("passed", passed));
    }
}