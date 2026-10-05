package com.elearning.backend.dto;

import com.elearning.backend.model.Category;
import lombok.Data;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class CategoryResponse {
    private Long id;
    private String name;
    private String imageUrl;
    private List<CategoryResponse> subCategories;

    public static CategoryResponse fromEntity(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setImageUrl(category.getImageUrl());

        if (category.getSubCategories() != null
                && org.hibernate.Hibernate.isInitialized(category.getSubCategories())) {
            response.setSubCategories(
                    category.getSubCategories()
                            .stream()
                            .map(CategoryResponse::fromEntity)
                            .collect(Collectors.toList())
            );
        } else {
            response.setSubCategories(Collections.emptyList());
        }

        return response;
    }
}