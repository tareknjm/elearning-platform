// CourseRepository.java
package com.elearning.backend.repository;
import com.elearning.backend.model.Course;
import com.elearning.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByStatus(Course.Status status);
    List<Course> findByInstructor(User instructor);
    List<Course> findByStatusAndTitleContainingIgnoreCase(Course.Status status, String keyword);
}