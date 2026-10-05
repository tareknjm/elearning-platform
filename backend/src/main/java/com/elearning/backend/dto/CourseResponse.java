package com.elearning.backend.dto;

import com.elearning.backend.model.Course;
import lombok.Data;

@Data
public class CourseResponse {

    private Long id;
    private String title;
    private String description;
    private String level;
    private String status;
    private String imageUrl;
    private String instructorName;
    private Long instructorId;
    private String categoryName;
    private Long categoryId;
    private double averageRating;
    private long totalRatings;

    public static CourseResponse fromEntity(Course course) {
        CourseResponse response = new CourseResponse();
        response.setId(course.getId());
        response.setTitle(course.getTitle());
        response.setDescription(course.getDescription());
        response.setLevel(course.getLevel());
        response.setStatus(course.getStatus().name());
        response.setImageUrl(course.getImageUrl());
        response.setInstructorName(course.getInstructor() != null
                ? course.getInstructor().getName() : "Inconnu");
        response.setInstructorId(course.getInstructor() != null
                ? course.getInstructor().getId() : null);
        if (course.getCategory() != null) {
            response.setCategoryName(course.getCategory().getName());
            response.setCategoryId(course.getCategory().getId());
        }
        response.setAverageRating(0.0);
        response.setTotalRatings(0);
        return response;
    }
}