package com.elearning.backend.service;

import com.elearning.backend.dto.CategoryResponse;
import com.elearning.backend.model.Category;
import com.elearning.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findByParentIsNull()
                .stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public CategoryResponse createCategory(String name, MultipartFile image) throws IOException {
        String imageUrl = fileStorageService.storeImage(image);
        Category category = Category.builder().name(name).imageUrl(imageUrl).build();
        return CategoryResponse.fromEntity(categoryRepository.save(category));
    }

    public CategoryResponse createSubCategory(String name, Long parentId, MultipartFile image) throws IOException {
        Category parent = categoryRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Catégorie parente introuvable"));
        String imageUrl = fileStorageService.storeImage(image);
        Category sub = Category.builder().name(name).parent(parent).imageUrl(imageUrl).build();
        return CategoryResponse.fromEntity(categoryRepository.save(sub));
    }

    public List<CategoryResponse> getSubCategories(Long parentId) {
        return categoryRepository.findByParentId(parentId)
                .stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie introuvable"));
        fileStorageService.deleteImage(category.getImageUrl());
        categoryRepository.delete(category);
    }
}