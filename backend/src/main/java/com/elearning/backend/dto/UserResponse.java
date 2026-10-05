package com.elearning.backend.dto;

import com.elearning.backend.model.User;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String role;
    private String plan;
    private boolean premium;
    private LocalDateTime planExpiresAt;

    public static UserResponse fromEntity(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());
        response.setPlan(user.getPlan().name());
        response.setPremium(user.isPremium());
        response.setPlanExpiresAt(user.getPlanExpiresAt());
        return response;
    }
}