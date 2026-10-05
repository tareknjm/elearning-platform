package com.elearning.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    public String storeImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        Path imagesPath = Paths.get(uploadDir, "images");
        if (!Files.exists(imagesPath)) {
            Files.createDirectories(imagesPath);
        }

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Files.copy(file.getInputStream(), imagesPath.resolve(fileName),
                StandardCopyOption.REPLACE_EXISTING);

        return "/images/" + fileName;
    }

    public void deleteImage(String imageUrl) {
        if (imageUrl == null || !imageUrl.startsWith("/images/")) {
            return;
        }
        try {
            String fileName = imageUrl.replace("/images/", "");
            Files.deleteIfExists(Paths.get(uploadDir, "images").resolve(fileName));
        } catch (IOException e) {
            System.err.println("Erreur suppression image: " + e.getMessage());
        }
    }
}