package com.elearning.backend.dto;

import lombok.Data;

@Data
public class ReviewApplicationRequest {
    private String decision; // "APPROVE" ou "REJECT"
    private String adminNote;
    private String temporaryPassword;
}