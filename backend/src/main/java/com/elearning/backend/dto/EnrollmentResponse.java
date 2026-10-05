package com.elearning.backend.dto;

import com.elearning.backend.model.Enrollment;
import lombok.Data;

@Data
public class EnrollmentResponse {

    private Long id;
    private Long courseId;
    private Long instructorId;
    private String courseTitle;
    private String courseLevel;
    private String courseImageUrl;
    private String categoryName;
    private String instructorName;
    private String enrolledAt;

    public static EnrollmentResponse fromEntity(Enrollment enrollment) {
        EnrollmentResponse response = new EnrollmentResponse();
        response.setId(enrollment.getId());
        response.setInstructorId(enrollment.getCourse().getInstructor().getId());
        response.setCourseId(enrollment.getCourse().getId());
        response.setCourseTitle(enrollment.getCourse().getTitle());
        response.setCourseLevel(enrollment.getCourse().getLevel());
        response.setCourseImageUrl(enrollment.getCourse().getImageUrl());
        response.setInstructorName(enrollment.getCourse().getInstructor().getName());
        if (enrollment.getCourse().getCategory() != null) {
            response.setCategoryName(enrollment.getCourse().getCategory().getName());
        }
        if (enrollment.getEnrolledAt() != null) {
            response.setEnrolledAt(enrollment.getEnrolledAt().toString());
        }
        return response;
    }
}