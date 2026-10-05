package com.elearning.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumeResponse {
    private Long courseId;
    private String courseTitle;
    private String courseImageUrl;
    private Long videoId;
    private String videoTitle;
    private Integer videoOrderIndex;
    private Integer totalVideos;
    private Integer progressPercent;
    private boolean quizReady;   // toutes vidéos vues mais quiz pas encore passé
    private boolean quizPassed;
}