package com.elearning.backend.controller;

import com.elearning.backend.dto.NotificationResponse;
import com.elearning.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            @RequestParam(defaultValue = "false") boolean archived,
            Authentication authentication) {
        return ResponseEntity.ok(
                notificationService.getMyNotifications(authentication.getName(), archived));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        return ResponseEntity.ok(Map.of(
                "count", notificationService.countUnread(authentication.getName())));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<NotificationResponse> archive(
            @PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(
                notificationService.archiveNotification(id, authentication.getName()));
    }

    @PutMapping("/{id}/restore")
    public ResponseEntity<NotificationResponse> restore(
            @PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(
                notificationService.restoreNotification(id, authentication.getName()));
    }

    @PutMapping("/archive-all-read")
    public ResponseEntity<Void> archiveAllRead(Authentication authentication) {
        notificationService.archiveAllRead(authentication.getName());
        return ResponseEntity.ok().build();
    }
}