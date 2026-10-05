package com.elearning.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quiz_options")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String optionText;
    private boolean correct;

    @ManyToOne
    @JoinColumn(name = "question_id")
    private QuizQuestion question;
}