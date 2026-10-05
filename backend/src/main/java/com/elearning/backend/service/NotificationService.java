package com.elearning.backend.service;

import com.elearning.backend.dto.NotificationResponse;
import com.elearning.backend.model.Notification;
import com.elearning.backend.model.User;
import com.elearning.backend.repository.NotificationRepository;
import com.elearning.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void send(User user, String title, String message, String type) {
        send(user, title, message, type, null);
    }

    public void send(User user, String title, String message, String type, String link) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .link(link)
                .build();
        notificationRepository.save(notification);
    }

    public List<NotificationResponse> getMyNotifications(String userEmail, boolean archived) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .filter(n -> n.isArchived() == archived)
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public long countUnread(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    public void markAllAsRead(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        List<Notification> unread = notificationRepository.findByUserAndIsReadFalse(user);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    public NotificationResponse archiveNotification(Long id, String userEmail) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification introuvable"));
        n.setArchived(true);
        n.setArchivedAt(LocalDateTime.now());
        n.setIsRead(true); // archiver marque aussi comme lue
        return NotificationResponse.fromEntity(notificationRepository.save(n));
    }

    public NotificationResponse restoreNotification(Long id, String userEmail) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification introuvable"));
        n.setArchived(false);
        n.setArchivedAt(null);
        return NotificationResponse.fromEntity(notificationRepository.save(n));
    }

    public void archiveAllRead(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        List<Notification> read = notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .filter(n -> Boolean.TRUE.equals(n.getIsRead()) && !n.isArchived())
                .collect(Collectors.toList());
        read.forEach(n -> {
            n.setArchived(true);
            n.setArchivedAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(read);
    }
}