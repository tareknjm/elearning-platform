package com.elearning.backend.controller;

import com.elearning.backend.dto.CourseProgressResponse;
import com.elearning.backend.dto.ResumeResponse;
import com.elearning.backend.service.QuizService;
import com.elearning.backend.service.VideoProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/learner")
@RequiredArgsConstructor
public class VideoProgressController {

    private final VideoProgressService videoProgressService;
    private final QuizService quizService;

    @PostMapping("/videos/{videoId}/watch")
    public ResponseEntity<Void> markAsWatched(
            @PathVariable Long videoId,
            Authentication authentication) {
        videoProgressService.markAsWatched(videoId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/courses/{courseId}/progress")
    public ResponseEntity<CourseProgressResponse> getCourseProgress(
            @PathVariable Long courseId,
            Authentication authentication) {
        return ResponseEntity.ok(
                videoProgressService.getCourseProgress(courseId, authentication.getName()));
    }

    @GetMapping("/resume")
    public ResponseEntity<ResumeResponse> getResume(Authentication authentication) {
        ResumeResponse resume = videoProgressService.getResumeData(authentication.getName());

        if (resume == null) {
            return ResponseEntity.noContent().build(); // aucune vidéo jamais vue
        }

        boolean passed = quizService.hasPassed(resume.getCourseId(), authentication.getName());
        resume.setQuizPassed(passed);

        return ResponseEntity.ok(resume);
    }
}