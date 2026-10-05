package com.elearning.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class QuizRequest {
    private String title;
    private Long courseId;
    private List<QuestionRequest> questions;

    @Data
    public static class QuestionRequest {
        private String questionText;
        private List<OptionRequest> options;
    }

    @Data
    public static class OptionRequest {
        private String optionText;
        private boolean correct;
    }
}