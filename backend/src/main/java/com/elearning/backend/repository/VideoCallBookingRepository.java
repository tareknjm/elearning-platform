package com.elearning.backend.repository;
import com.elearning.backend.model.VideoCallBooking;
import com.elearning.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface VideoCallBookingRepository extends JpaRepository<VideoCallBooking, Long> {
    List<VideoCallBooking> findByLearnerOrderByScheduledAtDesc(User learner);
    List<VideoCallBooking> findByInstructorOrderByScheduledAtDesc(User instructor);

    // Réservations confirmées qui chevauchent un créneau
    @Query("SELECT b FROM VideoCallBooking b WHERE b.instructor = :instructor " +
            "AND b.status = 'CONFIRMED' " +
            "AND b.scheduledAt < :end AND :start < b.scheduledAt")
    List<VideoCallBooking> findConflicts(User instructor, LocalDateTime start, LocalDateTime end);

    // Sessions CONFIRMED dont la date est passée depuis plus de 48h sans justificatif
    @Query("SELECT b FROM VideoCallBooking b WHERE b.status = 'ABSENT' " +
            "AND b.scheduledAt < :deadline")
    List<VideoCallBooking> findUnjustifiedAbsences(LocalDateTime deadline);
}