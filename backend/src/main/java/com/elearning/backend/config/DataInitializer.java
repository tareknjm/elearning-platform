package com.elearning.backend.config;

import com.elearning.backend.model.Category;
import com.elearning.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            List<Category> categories = List.of(
                    Category.builder().name("Développement Web").build(),
                    Category.builder().name("Développement Mobile").build(),
                    Category.builder().name("Java & Spring Boot").build(),
                    Category.builder().name("Python").build(),
                    Category.builder().name("JavaScript & React").build(),
                    Category.builder().name("Angular & Vue.js").build(),
                    Category.builder().name("Base de données & SQL").build(),
                    Category.builder().name("DevOps & Cloud").build(),
                    Category.builder().name("Intelligence Artificielle").build(),
                    Category.builder().name("Machine Learning").build(),
                    Category.builder().name("Cybersécurité").build(),
                    Category.builder().name("Design UI/UX").build(),
                    Category.builder().name("Flutter & Dart").build(),
                    Category.builder().name("PHP & Laravel").build(),
                    Category.builder().name("Node.js").build(),
                    Category.builder().name("Docker & Kubernetes").build(),
                    Category.builder().name("Algorithmique").build(),
                    Category.builder().name("Mathématiques").build(),
                    Category.builder().name("Gestion de projet").build(),
                    Category.builder().name("Marketing Digital").build()
            );
            categoryRepository.saveAll(categories);
            System.out.println("✅ " + categories.size() + " catégories initialisées !");
        }
    }
}