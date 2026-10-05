package com.elearning.backend.dto;

import lombok.Data;
import java.util.Map;

@Data
public class QuizSubmitRequest {
    // questionId -> optionId choisi
    private Map<Long, Long> answers;
}