package com.elearning.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "video_progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "video_id", nullable = false)
    private Video video;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    private boolean watched;

    private LocalDateTime watchedAt;

    @PrePersist
    public void prePersist() {
        this.watchedAt = LocalDateTime.now();
    }
}