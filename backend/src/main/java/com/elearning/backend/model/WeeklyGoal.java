package com.elearning.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "weekly_goals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private int targetLessons; // objectif fixé par le learner

    private LocalDate weekStart; // lundi de la semaine courante
}