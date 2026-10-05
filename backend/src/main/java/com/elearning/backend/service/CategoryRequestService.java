package com.elearning.backend.service;

import com.elearning.backend.dto.CategoryRequestDTO;
import com.elearning.backend.model.*;
import com.elearning.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryRequestService {

    private final CategoryRequestRepository requestRepo;
    private final UserRepository userRepo;
    private final CategoryRepository categoryRepo;
    private final NotificationService notificationService;

    public CategoryRequestDTO createRequest(String instructorEmail,
                                            String categoryName,
                                            String subCategoryName,
                                            String reason) {
        User instructor = userRepo.findByEmail(instructorEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        CategoryRequest request = CategoryRequest.builder()
                .instructor(instructor)
                .categoryName(categoryName)
                .subCategoryName(subCategoryName)
                .reason(reason)
                .build();

        requestRepo.save(request);

        userRepo.findAll().stream()
                .filter(u -> u.getRole() == User.Role.ADMIN)
                .forEach(admin -> notificationService.send(admin,
                        "Nouvelle demande de catégorie",
                        instructor.getName() + " demande la création de \"" + categoryName + "\"",
                        "CATEGORY_REQUEST",
                        "/admin/category-requests"));

        return CategoryRequestDTO.from(request);
    }

    public List<CategoryRequestDTO> getMyRequests(String instructorEmail) {
        User instructor = userRepo.findByEmail(instructorEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        return requestRepo.findByInstructorOrderByCreatedAtDesc(instructor)
                .stream().map(CategoryRequestDTO::from).collect(Collectors.toList());
    }

    public List<CategoryRequestDTO> getAllRequests() {
        return requestRepo.findAllByOrderByCreatedAtDesc()
                .stream().map(CategoryRequestDTO::from).collect(Collectors.toList());
    }

    public List<CategoryRequestDTO> getPendingRequests() {
        return requestRepo.findByStatusOrderByCreatedAtDesc(CategoryRequest.RequestStatus.PENDING)
                .stream().map(CategoryRequestDTO::from).collect(Collectors.toList());
    }

    @Transactional
    public CategoryRequestDTO reviewRequest(Long requestId, String decision, String adminNote) {
        CategoryRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Demande introuvable"));

        request.setAdminNote(adminNote);
        request.setReviewedAt(LocalDateTime.now());

        if ("APPROVE".equals(decision)) {
            request.setStatus(CategoryRequest.RequestStatus.APPROVED);

            // Créer la catégorie/sous-catégorie automatiquement
            Category parent = categoryRepo.findAll().stream()
                    .filter(c -> c.getName().equalsIgnoreCase(request.getCategoryName()) && c.getParent() == null)
                    .findFirst()
                    .orElseGet(() -> {
                        Category newCat = Category.builder()
                                .name(request.getCategoryName())
                                .build();
                        return categoryRepo.save(newCat);
                    });

            if (request.getSubCategoryName() != null && !request.getSubCategoryName().isBlank()) {
                boolean subExists = parent.getSubCategories().stream()
                        .anyMatch(s -> s.getName().equalsIgnoreCase(request.getSubCategoryName()));
                if (!subExists) {
                    Category sub = Category.builder()
                            .name(request.getSubCategoryName())
                            .parent(parent)
                            .build();
                    categoryRepo.save(sub);
                }
            }

            notificationService.send(request.getInstructor(),
                    "Demande de catégorie approuvée",
                    "La catégorie \"" + request.getCategoryName() + "\" a été créée.",
                    "CATEGORY_REQUEST", null);
        } else {
            request.setStatus(CategoryRequest.RequestStatus.REJECTED);
            notificationService.send(request.getInstructor(),
                    "Demande de catégorie refusée",
                    "Votre demande pour \"" + request.getCategoryName() + "\" a été refusée.",
                    "CATEGORY_REQUEST", null);
        }

        return CategoryRequestDTO.from(requestRepo.save(request));
    }
}