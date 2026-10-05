package com.elearning.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class InstructorApplicationRequest {

    @NotBlank
    private String fullName;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String phone;

    @NotBlank
    private String speciality;

    @NotBlank
    private String experience;

    @NotBlank
    private String motivation;

    private String linkedinUrl;

    @NotBlank
    private String educationLevel;

    private MultipartFile motivationFile;
}