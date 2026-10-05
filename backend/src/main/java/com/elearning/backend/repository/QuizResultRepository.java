package com.elearning.backend.repository;

import com.elearning.backend.model.Quiz;
import com.elearning.backend.model.QuizResult;
import com.elearning.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {
    Optional<QuizResult> findByUserAndQuiz(User user, Quiz quiz);
    boolean existsByUserAndQuizAndPassedTrue(User user, Quiz quiz);
    Optional<QuizResult> findTopByUserAndQuizOrderByIdDesc(User user, Quiz quiz); // ← ajoute ça
}