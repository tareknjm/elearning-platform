package com.elearning.backend.controller;

import com.elearning.backend.dto.WeeklyGoalDTO;
import com.elearning.backend.service.WeeklyGoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/learner/weekly-goal")
@RequiredArgsConstructor
public class WeeklyGoalController {

    private final WeeklyGoalService weeklyGoalService;

    @GetMapping
    public ResponseEntity<WeeklyGoalDTO> getWeeklyGoal(Authentication auth) {
        return ResponseEntity.ok(weeklyGoalService.getWeeklyGoal(auth.getName()));
    }

    @PutMapping
    public ResponseEntity<WeeklyGoalDTO> updateGoal(
            Authentication auth,
            @RequestParam int targetLessons) {
        return ResponseEntity.ok(weeklyGoalService.updateGoal(auth.getName(), targetLessons));
    }
}