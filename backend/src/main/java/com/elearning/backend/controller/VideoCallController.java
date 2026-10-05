package com.elearning.backend.controller;

import com.elearning.backend.model.*;
import com.elearning.backend.service.VideoCallService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class VideoCallController {

    private final VideoCallService videoCallService;

    // ── Instructeur ──
    @PostMapping("/api/instructor/availability")
    public ResponseEntity<?> saveAvailability(
            @RequestBody List<Map<String, Object>> slots,
            Authentication auth) {
        videoCallService.saveAvailabilities(auth.getName(), slots);
        return ResponseEntity.ok(Map.of("message", "Disponibilités sauvegardées"));
    }

    @GetMapping("/api/instructor/video-calls")
    public ResponseEntity<List<VideoCallBooking>> myCallsInstructor(Authentication auth) {
        return ResponseEntity.ok(videoCallService.getMyCallsAsInstructor(auth.getName()));
    }

    @PostMapping("/api/instructor/absences/{bookingId}")
    public ResponseEntity<AbsenceJustification> submitJustification(
            @PathVariable Long bookingId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("reason") String reason,
            Authentication auth) throws IOException {

        // Sauvegarde du fichier
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get("uploads/certificates");
        Files.createDirectories(uploadPath);
        Files.copy(file.getInputStream(), uploadPath.resolve(filename),
                StandardCopyOption.REPLACE_EXISTING);

        String fileUrl = "/uploads/certificates/" + filename;
        return ResponseEntity.ok(
                videoCallService.submitJustification(auth.getName(), bookingId, fileUrl, reason));
    }

    // ── Learner ──
    @GetMapping("/api/learner/video-calls/slots/{instructorId}/{courseId}")
    public ResponseEntity<List<Map<String, Object>>> getSlots(
            @PathVariable Long instructorId,
            @PathVariable Long courseId,
            Authentication auth) {
        return ResponseEntity.ok(videoCallService.getAvailableSlots(instructorId, courseId));
    }

    @PostMapping("/api/learner/video-calls/book")
    public ResponseEntity<VideoCallBooking> book(
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        Long courseId = Long.valueOf(body.get("courseId").toString());
        Long instructorId = Long.valueOf(body.get("instructorId").toString());
        LocalDateTime scheduledAt = LocalDateTime.parse(body.get("scheduledAt").toString());
        int duration = Integer.parseInt(body.get("durationMinutes").toString());

        return ResponseEntity.ok(
                videoCallService.bookCall(auth.getName(), courseId, instructorId,
                        scheduledAt, duration));
    }

    @GetMapping("/api/learner/video-calls")
    public ResponseEntity<List<VideoCallBooking>> myCallsLearner(Authentication auth) {
        return ResponseEntity.ok(videoCallService.getMyCallsAsLearner(auth.getName()));
    }

    // ── Admin ──
    @GetMapping("/api/admin/absences")
    public ResponseEntity<List<AbsenceJustification>> pendingJustifications() {
        return ResponseEntity.ok(videoCallService.getAllPendingJustifications());
    }

    @PostMapping("/api/admin/absences/{id}/review")
    public ResponseEntity<AbsenceJustification> reviewJustification(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                videoCallService.reviewJustification(id, body.get("decision"), body.get("adminNote")));
    }

    @GetMapping("/api/admin/penalties")
    public ResponseEntity<List<InstructorPenalty>> penalties() {
        return ResponseEntity.ok(videoCallService.getAllPenalties());
    }

    @GetMapping("/api/instructor/availability")
    public ResponseEntity<List<InstructorAvailability>> getMyAvailability(Authentication auth) {
        return ResponseEntity.ok(videoCallService.getAvailabilities(auth.getName()));
    }
    @GetMapping("/api/video-calls/{id}")
    public ResponseEntity<VideoCallBooking> getBooking(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(videoCallService.getBookingForUser(id, auth.getName()));
    }

    @PostMapping("/api/video-calls/{id}/join")
    public ResponseEntity<VideoCallBooking> joinCall(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(videoCallService.markJoined(id, auth.getName()));
    }

    @PostMapping("/api/video-calls/{id}/leave")
    public ResponseEntity<VideoCallBooking> leaveCall(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(videoCallService.markLeft(id, auth.getName()));
    }
    @GetMapping("/api/admin/absences/all")
    public ResponseEntity<List<AbsenceJustification>> allJustifications() {
        return ResponseEntity.ok(videoCallService.getAllJustifications());
    }
    @GetMapping("/api/instructor/availability/status")
    public ResponseEntity<Map<String, Object>> getAvailabilityStatus(Authentication auth) {
        return ResponseEntity.ok(videoCallService.getAvailabilityStatus(auth.getName()));
    }
}