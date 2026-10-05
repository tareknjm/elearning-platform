package com.elearning.backend.repository;

import com.elearning.backend.model.Course;
import com.elearning.backend.model.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VideoRepository extends JpaRepository<Video, Long> {
    List<Video> findByCourseOrderByOrderIndexAsc(Course course);
    List<Video> findByStatus(Video.VideoStatus status);
}