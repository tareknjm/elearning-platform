package com.elearning.backend.repository;

import com.elearning.backend.model.CategoryRequest;
import com.elearning.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoryRequestRepository extends JpaRepository<CategoryRequest, Long> {
    List<CategoryRequest> findByInstructorOrderByCreatedAtDesc(User instructor);
    List<CategoryRequest> findByStatusOrderByCreatedAtDesc(CategoryRequest.RequestStatus status);
    List<CategoryRequest> findAllByOrderByCreatedAtDesc();
}