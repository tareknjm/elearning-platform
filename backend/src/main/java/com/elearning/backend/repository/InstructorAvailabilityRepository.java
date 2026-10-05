package com.elearning.backend.repository;
import com.elearning.backend.model.InstructorAvailability;
import com.elearning.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InstructorAvailabilityRepository extends JpaRepository<InstructorAvailability, Long> {
    List<InstructorAvailability> findByInstructorAndActiveTrue(User instructor);
    void deleteByInstructor(User instructor);
}