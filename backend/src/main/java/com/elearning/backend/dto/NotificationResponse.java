package com.elearning.backend.dto;

import com.elearning.backend.model.Notification;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private String type;
    private String link; // ← ajouté
    private boolean read;
    private boolean archived;
    private LocalDateTime archivedAt;
    private LocalDateTime createdAt;

    public static NotificationResponse fromEntity(Notification n) {
        NotificationResponse r = new NotificationResponse();
        r.setId(n.getId());
        r.setTitle(n.getTitle());
        r.setMessage(n.getMessage());
        r.setType(n.getType());
        r.setLink(n.getLink());
        r.setRead(Boolean.TRUE.equals(n.getIsRead()));
        r.setArchived(n.isArchived());
        r.setArchivedAt(n.getArchivedAt());
        r.setCreatedAt(n.getCreatedAt());
        return r;
    }
}