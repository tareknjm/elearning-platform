package com.elearning.backend.service;

import com.elearning.backend.dto.ResumeResponse;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import com.elearning.backend.dto.CourseProgressResponse;
import com.elearning.backend.model.*;
import com.elearning.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
@RequiredArgsConstructor
public class VideoProgressService {

    private final VideoProgressRepository videoProgressRepository;
    private final UserRepository userRepository;
    private final VideoRepository videoRepository;
    private final CourseRepository courseRepository;

    // Marquer une vidéo comme vue
    public void markAsWatched(Long videoId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Video introuvable"));

        // Vérifier si déjà marquée
        videoProgressRepository.findByUserAndVideo(user, video).ifPresentOrElse(
                progress -> {
                    progress.setWatched(true);
                    videoProgressRepository.save(progress);
                },
                () -> {
                    VideoProgress progress = VideoProgress.builder()
                            .user(user)
                            .video(video)
                            .course(video.getCourse())
                            .watched(true)
                            .build();
                    videoProgressRepository.save(progress);
                }
        );
    }

    // Obtenir la progression d'un cours
    public CourseProgressResponse getCourseProgress(Long courseId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));

        List<Video> allVideos = videoRepository.findByCourseOrderByOrderIndexAsc(course);
        int total = allVideos.size();

        long watched = videoProgressRepository.countByUserAndCourseAndWatched(user, course, true);

        int percent = total > 0 ? (int) ((watched * 100) / total) : 0;
        boolean completed = percent == 100 && total > 0;

        return new CourseProgressResponse(courseId, total, (int) watched, percent, completed);
    }

    // Vérifier si une vidéo est vue
    public boolean isVideoWatched(Long videoId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Video introuvable"));

        return videoProgressRepository.findByUserAndVideo(user, video)
                .map(VideoProgress::isWatched)
                .orElse(false);
    }
    public ResumeResponse getResumeData(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Optional<VideoProgress> lastWatched = videoProgressRepository.findTopByUserOrderByWatchedAtDesc(user);

        if (lastWatched.isEmpty()) {
            return null; // aucune vidéo jamais vue → le frontend masquera le bloc "Reprendre"
        }

        Course course = lastWatched.get().getCourse();

        List<Video> allVideos = videoRepository.findByCourseOrderByOrderIndexAsc(course);
        int total = allVideos.size();

        List<VideoProgress> watchedList = videoProgressRepository.findByUserAndCourseAndWatched(user, course, true);
        Set<Long> watchedVideoIds = watchedList.stream()
                .map(vp -> vp.getVideo().getId())
                .collect(Collectors.toSet());

        long watchedCount = watchedVideoIds.size();
        int percent = total > 0 ? (int) ((watchedCount * 100) / total) : 0;

        // Cherche la 1ère vidéo non vue (la "suite logique")
        Video nextVideo = allVideos.stream()
                .filter(v -> !watchedVideoIds.contains(v.getId()))
                .findFirst()
                .orElse(allVideos.isEmpty() ? null : allVideos.get(allVideos.size() - 1));

        boolean allWatched = watchedCount == total && total > 0;

        ResumeResponse response = new ResumeResponse();
        response.setCourseId(course.getId());
        response.setCourseTitle(course.getTitle());
        response.setCourseImageUrl(course.getImageUrl());
        response.setTotalVideos(total);
        response.setProgressPercent(percent);

        if (nextVideo != null) {
            response.setVideoId(nextVideo.getId());
            response.setVideoTitle(nextVideo.getTitle());
            response.setVideoOrderIndex(nextVideo.getOrderIndex());
        }

        response.setQuizReady(allWatched);


        return response;
    }
}