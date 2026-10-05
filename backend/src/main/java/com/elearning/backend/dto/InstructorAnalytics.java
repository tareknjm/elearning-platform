package com.elearning.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class InstructorAnalytics {
    private int totalCourses;
    private int totalStudents;
    private double averageRating;
    private int totalVideos;
    private List<CourseAnalytics> courseStats;

    @Data
    @AllArgsConstructor
    public static class CourseAnalytics {
        private Long courseId;
        private String courseTitle;
        private int enrollments;
        private int completions;
        private double completionRate;
        private double averageRating;
        private long totalRatings;
        private List<VideoStats> videoStats;
    }

    @Data
    @AllArgsConstructor
    public static class VideoStats {
        private Long videoId;
        private String videoTitle;
        private int orderIndex;
        private long views;
    }
}