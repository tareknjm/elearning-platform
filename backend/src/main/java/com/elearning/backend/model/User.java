package com.elearning.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Plan plan = Plan.FREE;

    private LocalDateTime planExpiresAt;
    private LocalDateTime availabilityLastUpdated;

    public enum Role {
        ADMIN, INSTRUCTOR, LEARNER
    }

    public enum Plan {
        FREE, PREMIUM
    }

    public boolean isPremium() {
        if (plan == Plan.FREE) return false;
        if (planExpiresAt == null) return true;
        return planExpiresAt.isAfter(LocalDateTime.now());
    }
    @Column(name = "reset_token")
    private String resetToken;

    @Column(name = "reset_token_expiry")
    private LocalDateTime resetTokenExpiry;
}