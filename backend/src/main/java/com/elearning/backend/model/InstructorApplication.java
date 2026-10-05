package com.elearning.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "instructor_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstructorApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private String email;
    private String phone;
    private String speciality;
    private String experience;



    @Column(columnDefinition = "TEXT")
    private String motivation;

    @Column(columnDefinition = "TEXT")
    private String linkedinUrl;

    private String educationLevel;

    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status {
        PENDING, INTERVIEW_SCHEDULED, APPROVED, REJECTED, ARCHIVED
    }

    @Column(columnDefinition = "TEXT")
    private String adminNote;

    private LocalDateTime appliedAt;
    private LocalDateTime reviewedAt;

    private LocalDateTime interviewScheduledAt;
    private String meetingRoom;
    private String motivationFilePath;

    @Column(nullable = false)
    @Builder.Default
    private boolean archived = false;

    private LocalDateTime archivedAt;

    @PrePersist
    public void prePersist() {
        this.appliedAt = LocalDateTime.now();
        this.status = Status.PENDING;
    }
}