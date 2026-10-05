// InstructorPenaltyRepository.java
package com.elearning.backend.repository;
import com.elearning.backend.model.InstructorPenalty;
import com.elearning.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InstructorPenaltyRepository extends JpaRepository<InstructorPenalty, Long> {
    List<InstructorPenalty> findByInstructorOrderByIssuedAtDesc(User instructor);
    List<InstructorPenalty> findByStatusOrderByIssuedAtDesc(InstructorPenalty.PenaltyStatus status);
    Optional<InstructorPenalty> findByBookingId(Long bookingId);
}