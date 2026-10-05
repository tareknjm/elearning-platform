package com.elearning.backend.controller;

import com.elearning.backend.dto.CategoryResponse;
import com.elearning.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/{id}/sub")
    public ResponseEntity<List<CategoryResponse>> getSubCategories(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getSubCategories(id));
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @RequestParam String name,
            @RequestParam(required = false) MultipartFile image) throws IOException {
        return ResponseEntity.ok(categoryService.createCategory(name, image));
    }

    @PostMapping("/{parentId}/sub")
    public ResponseEntity<CategoryResponse> createSubCategory(
            @PathVariable Long parentId,
            @RequestParam String name,
            @RequestParam(required = false) MultipartFile image) throws IOException {
        return ResponseEntity.ok(categoryService.createSubCategory(name, parentId, image));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}