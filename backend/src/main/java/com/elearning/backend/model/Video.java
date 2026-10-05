package com.elearning.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "videos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Video {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String url;

    private Integer orderIndex;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VideoStatus status = VideoStatus.PENDING;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    public enum VideoStatus {
        PENDING, APPROVED, REJECTED
    }
    @Column(nullable = false)
    @Builder.Default
    private boolean archived = false;

    private java.time.LocalDateTime archivedAt;
}