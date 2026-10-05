package com.elearning.backend.dto;

import com.elearning.backend.model.InstructorApplication;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InstructorApplicationResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String speciality;
    private String experience;
    private String motivationFilePath;  // ← ajoute avec les autres champs
    private String motivation;
    private String linkedinUrl;
    private String educationLevel;
    private String status;
    private String adminNote;
    private LocalDateTime appliedAt;
    private LocalDateTime reviewedAt;
    private LocalDateTime interviewScheduledAt;
    private String meetingRoom;
    private boolean archived;
    private LocalDateTime archivedAt;

    public static InstructorApplicationResponse fromEntity(InstructorApplication a) {
        InstructorApplicationResponse r = new InstructorApplicationResponse();
        r.setId(a.getId());
        r.setFullName(a.getFullName());
        r.setEmail(a.getEmail());
        r.setPhone(a.getPhone());
        r.setSpeciality(a.getSpeciality());
        r.setExperience(a.getExperience());
        r.setMotivation(a.getMotivation());
        r.setLinkedinUrl(a.getLinkedinUrl());
        r.setEducationLevel(a.getEducationLevel());
        r.setStatus(a.getStatus().name());
        r.setAdminNote(a.getAdminNote());
        r.setAppliedAt(a.getAppliedAt());
        r.setReviewedAt(a.getReviewedAt());
        r.setInterviewScheduledAt(a.getInterviewScheduledAt());
        r.setMeetingRoom(a.getMeetingRoom());
        r.setArchived(a.isArchived());
        r.setArchivedAt(a.getArchivedAt());
        r.setMotivationFilePath(a.getMotivationFilePath());  // ← ajoute à la fin
        return r;
    }
}