package com.elearning.backend.service;

import com.elearning.backend.dto.VideoResponse;
import com.elearning.backend.model.*;
import com.elearning.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VideoService {

    private final VideoRepository videoRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    // Constructeur manuel avec @Lazy sur NotificationService
    public VideoService(VideoRepository videoRepository,
                        CourseRepository courseRepository,
                        UserRepository userRepository,
                        @Lazy NotificationService notificationService) {
        this.videoRepository = videoRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public VideoResponse uploadVideo(Long courseId, String title,
                                     Integer orderIndex, MultipartFile file) throws IOException {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Files.copy(file.getInputStream(), uploadPath.resolve(fileName),
                StandardCopyOption.REPLACE_EXISTING);

        Video video = Video.builder()
                .title(title)
                .url("/videos/" + fileName)
                .orderIndex(orderIndex != null ? orderIndex : 0)
                .course(course)
                .status(Video.VideoStatus.PENDING)
                .build();

        videoRepository.save(video);

        // Notifier tous les admins
        userRepository.findAll().stream()
                .filter(u -> "ROLE_ADMIN".equals(u.getRole().name()))
                .forEach(admin -> notificationService.send(
                        admin,
                        "Nouvelle vidéo à vérifier",
                        course.getInstructor().getName() + " a uploadé \"" + title
                                + "\" dans \"" + course.getTitle() + "\"",
                        "VIDEO_PENDING"
                ));

        return VideoResponse.fromEntity(video);
    }
    public List<VideoResponse> getAllVideos(boolean archived) {
        return videoRepository.findAll()
                .stream()
                .filter(v -> v.isArchived() == archived)
                .map(VideoResponse::fromEntity)
                .collect(Collectors.toList());
    }
    public List<VideoResponse> getVideosByCourse(Long courseId, String userEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));

        boolean isPremium = false;
        if (userEmail != null) {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            isPremium = user != null && user.isPremium();
        }

        final int FREE_LIMIT = 2; // 2 premières vidéos accessibles en FREE
        List<Video> videos = videoRepository.findByCourseOrderByOrderIndexAsc(course);
        List<VideoResponse> responses = new java.util.ArrayList<>();

        for (int i = 0; i < videos.size(); i++) {
            VideoResponse r = VideoResponse.fromEntity(videos.get(i));
            if (!isPremium && i >= FREE_LIMIT) {
                r.setUrl(null);   // on ne fuite jamais le lien réel
                r.setLocked(true);
            }
            responses.add(r);
        }
        return responses;
    }
    public VideoResponse archiveVideo(Long id) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vidéo introuvable"));
        video.setArchived(true);
        video.setArchivedAt(java.time.LocalDateTime.now());
        return VideoResponse.fromEntity(videoRepository.save(video));
    }

    public VideoResponse restoreVideo(Long id) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vidéo introuvable"));
        video.setArchived(false);
        video.setArchivedAt(null);
        return VideoResponse.fromEntity(videoRepository.save(video));
    }
    public List<VideoResponse> getPendingVideos() {
        return videoRepository.findByStatus(Video.VideoStatus.PENDING)
                .stream().map(VideoResponse::fromEntity).collect(Collectors.toList());
    }

    public VideoResponse approveVideo(Long videoId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Vidéo introuvable"));
        video.setStatus(Video.VideoStatus.APPROVED);
        return VideoResponse.fromEntity(videoRepository.save(video));
    }

    public VideoResponse rejectVideo(Long videoId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Vidéo introuvable"));
        video.setStatus(Video.VideoStatus.REJECTED);
        return VideoResponse.fromEntity(videoRepository.save(video));
    }

    public void deleteVideo(Long videoId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Vidéo introuvable"));
        try {
            String fileName = video.getUrl().replace("/videos/", "");
            Files.deleteIfExists(Paths.get(uploadDir).resolve(fileName));
        } catch (IOException e) {
            System.err.println("Erreur suppression: " + e.getMessage());
        }
        videoRepository.delete(video);
    }
}