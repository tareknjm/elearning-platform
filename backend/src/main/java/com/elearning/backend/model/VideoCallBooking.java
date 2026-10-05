package com.elearning.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "video_call_bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoCallBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "learner_id", nullable = false)
    private User learner;

    @ManyToOne
    @JoinColumn(name = "instructor_id", nullable = false)
    private User instructor;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    @Column(nullable = false)
    private int durationMinutes; // 30 ou 60

    @Column(nullable = false)
    private double amountPaid; // durationMinutes * 0.5

    @Column(nullable = false)
    private String jitsiRoom; // "elearn-call-{uuid}"

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BookingStatus status = BookingStatus.CONFIRMED;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public enum BookingStatus {
        CONFIRMED, COMPLETED, CANCELLED, ABSENT
    }
    @Column(nullable = false)
    @Builder.Default
    private boolean instructorJoined = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean learnerJoined = false;
}