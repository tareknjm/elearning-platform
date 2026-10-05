package com.elearning.backend.dto;

import com.elearning.backend.model.Video;
import lombok.Data;

@Data
public class VideoResponse {
    private Long id;
    private String title;
    private String url;
    private Integer orderIndex;
    private Long courseId;
    private String courseTitle;
    private String status;
    private boolean archived;
    private java.time.LocalDateTime archivedAt;
    private boolean locked; // ajouté — true si la vidéo nécessite Premium

    public static VideoResponse fromEntity(Video video) {
        VideoResponse r = new VideoResponse();
        r.setId(video.getId());
        r.setTitle(video.getTitle());
        r.setUrl(video.getUrl());
        r.setOrderIndex(video.getOrderIndex());
        r.setCourseId(video.getCourse().getId());
        r.setCourseTitle(video.getCourse().getTitle());
        r.setStatus(video.getStatus() != null ? video.getStatus().name() : "PENDING");
        r.setArchived(video.isArchived());
        r.setArchivedAt(video.getArchivedAt());
        r.setLocked(false);
        return r;
    }
}