package com.elearning.backend.controller;

import com.elearning.backend.dto.VideoResponse;
import com.elearning.backend.service.VideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;

    @PostMapping("/instructor/videos/upload")
    public ResponseEntity<VideoResponse> uploadVideo(
            @RequestParam Long courseId,
            @RequestParam String title,
            @RequestParam(defaultValue = "0") Integer orderIndex,
            @RequestParam MultipartFile file) throws IOException {
        return ResponseEntity.ok(
                videoService.uploadVideo(courseId, title, orderIndex, file));
    }

    @GetMapping("/videos/course/{courseId}")
    public ResponseEntity<List<VideoResponse>> getVideosByCourse(
            @PathVariable Long courseId,
            org.springframework.security.core.Authentication authentication) {
        String email = (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getName()))
                ? authentication.getName() : null;
        return ResponseEntity.ok(videoService.getVideosByCourse(courseId, email));
    }

    @DeleteMapping("/instructor/videos/{videoId}")
    public ResponseEntity<Void> deleteVideo(@PathVariable Long videoId) {
        videoService.deleteVideo(videoId);
        return ResponseEntity.noContent().build();
    }

    // Admin — vidéos en attente
    @GetMapping("/admin/videos/pending")
    public ResponseEntity<List<VideoResponse>> getPendingVideos() {
        return ResponseEntity.ok(videoService.getPendingVideos());
    }

    // Admin — approuver vidéo
    @PutMapping("/admin/videos/{id}/approve")
    public ResponseEntity<VideoResponse> approveVideo(@PathVariable Long id) {
        return ResponseEntity.ok(videoService.approveVideo(id));
    }

    // Admin — refuser vidéo
    @PutMapping("/admin/videos/{id}/reject")
    public ResponseEntity<VideoResponse> rejectVideo(@PathVariable Long id) {
        return ResponseEntity.ok(videoService.rejectVideo(id));
    }
    // Admin — toutes les vidéos

    @GetMapping("/admin/videos")
    public ResponseEntity<List<VideoResponse>> getAllVideos(
            @RequestParam(defaultValue = "false") boolean archived) {
        return ResponseEntity.ok(videoService.getAllVideos(archived));
    }

    @PutMapping("/admin/videos/{id}/archive")
    public ResponseEntity<VideoResponse> archiveVideo(@PathVariable Long id) {
        return ResponseEntity.ok(videoService.archiveVideo(id));
    }

    @PutMapping("/admin/videos/{id}/restore")
    public ResponseEntity<VideoResponse> restoreVideo(@PathVariable Long id) {
        return ResponseEntity.ok(videoService.restoreVideo(id));
    }
}