package com.elearning.backend.dto;

import com.elearning.backend.model.Rating;
import lombok.Data;

@Data
public class RatingResponse {
    private Long id;
    private String userName;
    private int stars;
    private String comment;
    private String createdAt;

    public static RatingResponse fromEntity(Rating rating) {
        RatingResponse r = new RatingResponse();
        r.setId(rating.getId());
        r.setUserName(rating.getUser().getName());
        r.setStars(rating.getStars());
        r.setComment(rating.getComment());
        r.setCreatedAt(rating.getCreatedAt() != null
                ? rating.getCreatedAt().toLocalDate().toString() : "");
        return r;
    }
}