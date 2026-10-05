package com.elearning.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CourseProgressResponse {
    private Long courseId;
    private int totalVideos;
    private int watchedVideos;
    private int progressPercent;
    private boolean completed;
}