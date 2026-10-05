package com.elearning.backend.controller;

import com.elearning.backend.dto.UserResponse;
import com.elearning.backend.model.User;
import com.elearning.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/subscription")
@RequiredArgsConstructor
public class SubscriptionController {

    private final UserRepository userRepository;

    @PostMapping("/activate")
    public ResponseEntity<UserResponse> activate(
            @RequestParam String billing,
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        user.setPlan(User.Plan.PREMIUM);
        user.setPlanExpiresAt(
                billing.equals("yearly")
                        ? LocalDateTime.now().plusYears(1)
                        : LocalDateTime.now().plusMonths(1)
        );

        userRepository.save(user);
        return ResponseEntity.ok(UserResponse.fromEntity(user));
    }

    @PostMapping("/cancel")
    public ResponseEntity<UserResponse> cancel(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        user.setPlan(User.Plan.FREE);
        user.setPlanExpiresAt(null);
        userRepository.save(user);

        return ResponseEntity.ok(UserResponse.fromEntity(user));
    }

    @GetMapping("/status")
    public ResponseEntity<UserResponse> status(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        return ResponseEntity.ok(UserResponse.fromEntity(user));
    }
}