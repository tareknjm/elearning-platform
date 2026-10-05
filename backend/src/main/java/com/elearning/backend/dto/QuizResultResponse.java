package com.elearning.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class QuizResultResponse {
    private int score;
    private int totalQuestions;
    private int scorePercent;
    private boolean passed;
    private String message;
}