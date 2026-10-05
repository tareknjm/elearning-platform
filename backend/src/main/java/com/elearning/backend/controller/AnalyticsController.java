package com.elearning.backend.controller;

import com.elearning.backend.dto.InstructorAnalytics;
import com.elearning.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/instructor")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/analytics")
    public ResponseEntity<InstructorAnalytics> getAnalytics(
            Authentication authentication) {
        return ResponseEntity.ok(
                analyticsService.getAnalytics(authentication.getName()));
    }
}