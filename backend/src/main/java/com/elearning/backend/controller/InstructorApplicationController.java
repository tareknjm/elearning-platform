package com.elearning.backend.controller;

import com.elearning.backend.dto.*;
import com.elearning.backend.model.InstructorApplication;
import com.elearning.backend.service.InstructorApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.ModelAttribute;


import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class InstructorApplicationController {

    private final InstructorApplicationService applicationService;

    @PostMapping(
            value = "/applications/instructor",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<InstructorApplicationResponse> apply(
            @ModelAttribute InstructorApplicationRequest request) {

        return ResponseEntity.ok(applicationService.apply(request));
    }

    @GetMapping("/admin/applications")
    public ResponseEntity<List<InstructorApplicationResponse>> getAllApplications(
            @RequestParam(defaultValue = "false") boolean archived) {
        return ResponseEntity.ok(applicationService.getAllApplications(archived));
    }

    @GetMapping("/admin/applications/status/{status}")
    public ResponseEntity<List<InstructorApplicationResponse>> getByStatus(
            @PathVariable String status) {
        return ResponseEntity.ok(applicationService.getByStatus(
                InstructorApplication.Status.valueOf(status.toUpperCase())));
    }

    @GetMapping("/admin/applications/{id}")
    public ResponseEntity<InstructorApplicationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getById(id));
    }

    @PutMapping("/admin/applications/{id}/schedule-interview")
    public ResponseEntity<InstructorApplicationResponse> scheduleInterview(
            @PathVariable Long id,
            @RequestBody ScheduleInterviewRequest request) {
        return ResponseEntity.ok(applicationService.scheduleInterview(id, request));
    }

    @PutMapping("/admin/applications/{id}/review")
    public ResponseEntity<InstructorApplicationResponse> review(
            @PathVariable Long id,
            @RequestBody ReviewApplicationRequest request) {
        return ResponseEntity.ok(applicationService.review(id, request));
    }

    @PutMapping("/admin/applications/{id}/archive")
    public ResponseEntity<InstructorApplicationResponse> archive(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.archiveApplication(id));
    }

    @PutMapping("/admin/applications/{id}/restore")
    public ResponseEntity<InstructorApplicationResponse> restore(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.restoreApplication(id));
    }

    @GetMapping("/admin/applications/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(Map.of("pending", applicationService.countPending()));
    }
}