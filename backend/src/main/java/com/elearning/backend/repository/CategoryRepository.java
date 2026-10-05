package com.elearning.backend.repository;

import com.elearning.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Catégories principales (sans parent), sous-catégories chargées dans la même requête
    @Query("SELECT DISTINCT c FROM Category c LEFT JOIN FETCH c.subCategories WHERE c.parent IS NULL")
    List<Category> findByParentIsNull();

    // Sous-catégories d'une catégorie donnée
    List<Category> findByParentId(Long parentId);
}