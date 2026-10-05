package com.elearning.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.DayOfWeek;

@Entity
@Table(name = "instructor_availabilities")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstructorAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "instructor_id", nullable = false)
    private User instructor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DayOfWeek dayOfWeek; // MONDAY, TUESDAY...

    @Column(nullable = false)
    private int startHour; // 0-23

    @Column(nullable = false)
    private int durationMinutes; // 30, 60

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}