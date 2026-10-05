package com.elearning.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "instructor_penalties")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstructorPenalty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "instructor_id", nullable = false)
    private User instructor;

    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false)
    private VideoCallBooking booking;

    @Column(nullable = false)
    private double amount; // amende en €

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PenaltyStatus status = PenaltyStatus.PENDING;

    private LocalDateTime issuedAt;
    private LocalDateTime paidAt;

    @PrePersist
    public void prePersist() {
        this.issuedAt = LocalDateTime.now();
    }

    public enum PenaltyStatus {
        PENDING, PAID, WAIVED
    }
}