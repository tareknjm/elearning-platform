package com.elearning.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "absence_justifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AbsenceJustification {

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
    private String certificateUrl; // chemin du fichier uploadé

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private JustificationStatus status = JustificationStatus.PENDING;

    private String adminNote;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;

    @PrePersist
    public void prePersist() {
        this.submittedAt = LocalDateTime.now();
    }

    public enum JustificationStatus {
        PENDING, APPROVED, REJECTED
    }
}