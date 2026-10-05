package com.elearning.backend.repository;

import com.elearning.backend.model.Course;
import com.elearning.backend.model.Enrollment;
import com.elearning.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByUser(User user);
    boolean existsByUserAndCourse(User user, Course course);
    List<Enrollment> findByCourse(Course course);
}