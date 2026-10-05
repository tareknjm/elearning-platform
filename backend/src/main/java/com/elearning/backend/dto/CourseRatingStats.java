package com.elearning.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class CourseRatingStats {
    private double averageRating;
    private long totalRatings;
    private List<RatingResponse> reviews;
    private boolean userHasRated;
    private int userRating;
    private String userComment;
}