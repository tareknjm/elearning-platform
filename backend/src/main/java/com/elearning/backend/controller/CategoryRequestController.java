package com.elearning.backend.controller;

import com.elearning.backend.dto.CategoryRequestDTO;
import com.elearning.backend.service.CategoryRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class CategoryRequestController {

    private final CategoryRequestService requestService;

    @PostMapping("/api/instructor/category-requests")
    public ResponseEntity<CategoryRequestDTO> create(
            @RequestBody Map<String, String> body,
            Authentication auth) {
        return ResponseEntity.ok(requestService.createRequest(
                auth.getName(),
                body.get("categoryName"),
                body.get("subCategoryName"),
                body.get("reason")));
    }

    @GetMapping("/api/instructor/category-requests")
    public ResponseEntity<List<CategoryRequestDTO>> myRequests(Authentication auth) {
        return ResponseEntity.ok(requestService.getMyRequests(auth.getName()));
    }

    @GetMapping("/api/admin/category-requests")
    public ResponseEntity<List<CategoryRequestDTO>> all() {
        return ResponseEntity.ok(requestService.getAllRequests());
    }

    @GetMapping("/api/admin/category-requests/pending")
    public ResponseEntity<List<CategoryRequestDTO>> pending() {
        return ResponseEntity.ok(requestService.getPendingRequests());
    }

    @PostMapping("/api/admin/category-requests/{id}/review")
    public ResponseEntity<CategoryRequestDTO> review(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(requestService.reviewRequest(
                id, body.get("decision"), body.get("adminNote")));
    }
}