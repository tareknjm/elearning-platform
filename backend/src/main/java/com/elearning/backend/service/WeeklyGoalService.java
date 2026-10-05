package com.elearning.backend.service;

import com.elearning.backend.dto.WeeklyGoalDTO;
import com.elearning.backend.model.User;
import com.elearning.backend.model.VideoProgress;
import com.elearning.backend.model.WeeklyGoal;
import com.elearning.backend.repository.UserRepository;
import com.elearning.backend.repository.VideoProgressRepository;
import com.elearning.backend.repository.WeeklyGoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WeeklyGoalService {

    private final WeeklyGoalRepository weeklyGoalRepository;
    private final VideoProgressRepository videoProgressRepository;
    private final UserRepository userRepository;

    private LocalDate getCurrentWeekStart() {
        return LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    public WeeklyGoalDTO getWeeklyGoal(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate weekStart = getCurrentWeekStart();
        LocalDateTime weekStartDT = weekStart.atStartOfDay();
        LocalDateTime weekEndDT = weekStart.plusDays(7).atStartOfDay();

        WeeklyGoal goal = weeklyGoalRepository
                .findByUserAndWeekStart(user, weekStart)
                .orElse(WeeklyGoal.builder()
                        .user(user)
                        .targetLessons(5)
                        .weekStart(weekStart)
                        .build());

        List<VideoProgress> watched = videoProgressRepository
                .findByUserAndWatchedTrueAndWatchedAtBetween(user, weekStartDT, weekEndDT);

        return WeeklyGoalDTO.builder()
                .targetLessons(goal.getTargetLessons())
                .completedLessons(watched.size())
                .weekStart(weekStart.toString())
                .build();
    }

    public WeeklyGoalDTO updateGoal(String email, int targetLessons) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate weekStart = getCurrentWeekStart();

        WeeklyGoal goal = weeklyGoalRepository
                .findByUserAndWeekStart(user, weekStart)
                .orElse(WeeklyGoal.builder()
                        .user(user)
                        .weekStart(weekStart)
                        .build());

        goal.setTargetLessons(targetLessons);
        weeklyGoalRepository.save(goal);

        return getWeeklyGoal(email);
    }
}