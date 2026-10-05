package com.elearning.backend.dto;

import com.elearning.backend.model.CategoryRequest;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CategoryRequestDTO {
    private Long id;
    private String categoryName;
    private String subCategoryName;
    private String reason;
    private String status;
    private String adminNote;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
    private Long instructorId;
    private String instructorName;

    public static CategoryRequestDTO from(CategoryRequest r) {
        return CategoryRequestDTO.builder()
                .id(r.getId())
                .categoryName(r.getCategoryName())
                .subCategoryName(r.getSubCategoryName())
                .reason(r.getReason())
                .status(r.getStatus().name())
                .adminNote(r.getAdminNote())
                .createdAt(r.getCreatedAt())
                .reviewedAt(r.getReviewedAt())
                .instructorId(r.getInstructor().getId())
                .instructorName(r.getInstructor().getName())
                .build();
    }
}