package com.elearning.backend.repository;

import com.elearning.backend.model.WeeklyGoal;
import com.elearning.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface WeeklyGoalRepository extends JpaRepository<WeeklyGoal, Long> {
    Optional<WeeklyGoal> findByUserAndWeekStart(User user, LocalDate weekStart);
}