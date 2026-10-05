package com.elearning.backend.controller;

import com.elearning.backend.dto.*;
import com.elearning.backend.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @PostMapping("/learner/courses/{courseId}/rate")
    public ResponseEntity<RatingResponse> rate(
            @PathVariable Long courseId,
            @RequestBody RatingRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(ratingService.addOrUpdateRating(
                courseId, request, authentication.getName()));
    }

    @GetMapping("/courses/{courseId}/ratings")
    public ResponseEntity<CourseRatingStats> getRatings(
            @PathVariable Long courseId,
            Authentication authentication) {
        String email = authentication != null
                ? authentication.getName() : null;
        return ResponseEntity.ok(
                ratingService.getRatingStats(courseId, email));
    }
}