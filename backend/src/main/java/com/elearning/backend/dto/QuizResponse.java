package com.elearning.backend.dto;

import com.elearning.backend.model.*;
import lombok.Data;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class QuizResponse {
    private Long id;
    private String title;
    private Long courseId;
    private List<QuestionResponse> questions;

    @Data
    public static class QuestionResponse {
        private Long id;
        private String questionText;
        private List<OptionResponse> options;
    }

    @Data
    public static class OptionResponse {
        private Long id;
        private String optionText;
        // Ne pas exposer isCorrect au learner !
    }

    public static QuizResponse fromEntity(Quiz quiz) {
        QuizResponse response = new QuizResponse();
        response.setId(quiz.getId());
        response.setTitle(quiz.getTitle());
        response.setCourseId(quiz.getCourse().getId());
        if (quiz.getQuestions() != null) {
            response.setQuestions(quiz.getQuestions().stream().map(q -> {
                QuestionResponse qr = new QuestionResponse();
                qr.setId(q.getId());
                qr.setQuestionText(q.getQuestionText());
                if (q.getOptions() != null) {
                    qr.setOptions(q.getOptions().stream().map(o -> {
                        OptionResponse or = new OptionResponse();
                        or.setId(o.getId());
                        or.setOptionText(o.getOptionText());
                        return or;
                    }).collect(Collectors.toList()));
                }
                return qr;
            }).collect(Collectors.toList()));
        }
        return response;
    }
}