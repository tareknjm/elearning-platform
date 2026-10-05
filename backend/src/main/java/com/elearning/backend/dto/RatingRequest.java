package com.elearning.backend.dto;
import lombok.Data;

@Data
public class RatingRequest {
    private int stars;
    private String comment;
}