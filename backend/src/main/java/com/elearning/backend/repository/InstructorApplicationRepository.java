package com.elearning.backend.repository;

import com.elearning.backend.model.InstructorApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InstructorApplicationRepository
        extends JpaRepository<InstructorApplication, Long> {

    List<InstructorApplication> findByStatusOrderByAppliedAtDesc(
            InstructorApplication.Status status);

    List<InstructorApplication> findAllByOrderByAppliedAtDesc();

    boolean existsByEmail(String email);

    Optional<InstructorApplication> findByEmail(String email);
}