package com.elearning.backend.repository;

import com.elearning.backend.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface VideoProgressRepository extends JpaRepository<VideoProgress, Long> {
    Optional<VideoProgress> findByUserAndVideo(User user, Video video);
    List<VideoProgress> findByUserAndCourse(User user, Course course);
    long countByUserAndCourseAndWatched(User user, Course course, boolean watched);
    long countByVideoAndWatched(Video video, boolean watched);
    Optional<VideoProgress> findTopByUserOrderByWatchedAtDesc(User user);
    List<VideoProgress> findByUserAndCourseAndWatched(User user, Course course, boolean watched);

    // ── Objectif hebdomadaire ──
    List<VideoProgress> findByUserAndWatchedTrueAndWatchedAtBetween(
            User user, LocalDateTime start, LocalDateTime end
    );
}