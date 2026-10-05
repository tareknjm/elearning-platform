package com.elearning.backend.repository;

import com.elearning.backend.model.Course;
import com.elearning.backend.model.Rating;
import com.elearning.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByCourseOrderByCreatedAtDesc(Course course);
    Optional<Rating> findByUserAndCourse(User user, Course course);
    boolean existsByUserAndCourse(User user, Course course);

    @Query("SELECT AVG(r.stars) FROM Rating r WHERE r.course = :course")
    Double findAverageStarsByCourse(@Param("course") Course course);

    @Query("SELECT COUNT(r) FROM Rating r WHERE r.course = :course")
    long countByCourse(@Param("course") Course course);
}