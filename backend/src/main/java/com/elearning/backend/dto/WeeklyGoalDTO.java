package com.elearning.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WeeklyGoalDTO {
    private int targetLessons;      // objectif
    private int completedLessons;   // leçons regardées cette semaine
    private String weekStart;       // pour info côté frontend
}