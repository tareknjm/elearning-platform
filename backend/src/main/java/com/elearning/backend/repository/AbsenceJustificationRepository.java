// AbsenceJustificationRepository.java
package com.elearning.backend.repository;
import com.elearning.backend.model.AbsenceJustification;
import com.elearning.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AbsenceJustificationRepository extends JpaRepository<AbsenceJustification, Long> {
    List<AbsenceJustification> findByInstructorOrderBySubmittedAtDesc(User instructor);
    List<AbsenceJustification> findByStatusOrderBySubmittedAtDesc(AbsenceJustification.JustificationStatus status);
    Optional<AbsenceJustification> findByBookingId(Long bookingId);
}