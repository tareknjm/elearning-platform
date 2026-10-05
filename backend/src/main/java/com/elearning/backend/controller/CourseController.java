package com.elearning.backend.controller;

import com.elearning.backend.dto.CourseRequest;
import com.elearning.backend.dto.CourseResponse;
import com.elearning.backend.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping("/courses")
    public ResponseEntity<List<CourseResponse>> getApprovedCourses() {
        return ResponseEntity.ok(courseService.getApprovedCourses());
    }

    @GetMapping("/courses/{id}")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @GetMapping("/courses/search")
    public ResponseEntity<List<CourseResponse>> searchCourses(@RequestParam String keyword) {
        return ResponseEntity.ok(courseService.searchCourses(keyword));
    }

    @PostMapping("/instructor/courses")
    public ResponseEntity<CourseResponse> createCourse(
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) Long categoryId,
            @RequestParam("image") MultipartFile image,
            Authentication authentication) throws IOException {

        CourseRequest request = new CourseRequest();
        request.setTitle(title);
        request.setDescription(description);
        request.setLevel(level);
        request.setCategoryId(categoryId);

        return ResponseEntity.ok(
                courseService.createCourse(request, image, authentication.getName()));
    }

    // Instructor — mes formations (actives par défaut, ?archived=true pour l'historique)
    @GetMapping("/instructor/courses")
    public ResponseEntity<List<CourseResponse>> getMyCourses(
            @RequestParam(defaultValue = "false") boolean archived,
            Authentication authentication) {
        return ResponseEntity.ok(courseService.getMyCourses(authentication.getName(), archived));
    }

    // Admin — toutes les formations (actives par défaut, ?archived=true pour l'historique)
    @GetMapping("/admin/courses")
    public ResponseEntity<List<CourseResponse>> getAllCourses(
            @RequestParam(defaultValue = "false") boolean archived) {
        return ResponseEntity.ok(courseService.getAllCourses(archived));
    }

    @PutMapping("/admin/courses/{id}/approve")
    public ResponseEntity<CourseResponse> approveCourse(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.approveCourse(id));
    }

    @PutMapping("/admin/courses/{id}/reject")
    public ResponseEntity<CourseResponse> rejectCourse(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.rejectCourse(id));
    }

    // Archiver — instructeur (ses formations) ou admin (toutes)
    @PutMapping("/courses/{id}/archive")
    public ResponseEntity<CourseResponse> archiveCourse(
            @PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(courseService.archiveCourse(id, authentication));
    }

    // Restaurer — instructeur (ses formations) ou admin (toutes)
    @PutMapping("/courses/{id}/restore")
    public ResponseEntity<CourseResponse> restoreCourse(
            @PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(courseService.restoreCourse(id, authentication));
    }

    @GetMapping("/courses/category/{categoryId}")
    public ResponseEntity<List<CourseResponse>> getCoursesByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(courseService.getCoursesByCategory(categoryId));
    }
}