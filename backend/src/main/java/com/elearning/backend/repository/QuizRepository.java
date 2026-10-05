
package com.elearning.backend.repository;

import com.elearning.backend.model.Course;
import com.elearning.backend.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    Optional<Quiz> findByCourse(Course course);
}