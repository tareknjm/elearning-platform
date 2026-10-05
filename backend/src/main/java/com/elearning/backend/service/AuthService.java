package com.elearning.backend.service;

import com.elearning.backend.dto.*;
import com.elearning.backend.model.User;
import com.elearning.backend.repository.UserRepository;
import com.elearning.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email deja utilise");
        }

        // Bloquer l'inscription directe en tant qu'Instructor
        User.Role role;
        String requestedRole = request.getRole() != null
                ? request.getRole().toUpperCase() : "LEARNER";

        if ("INSTRUCTOR".equals(requestedRole)) {
            // Forcer en LEARNER si tentative directe
            role = User.Role.LEARNER;
        } else if ("ADMIN".equals(requestedRole)) {
            role = User.Role.ADMIN;
        } else {
            role = User.Role.LEARNER;
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);

        String token = jwtUtil.generateToken(
                user.getEmail(), user.getRole().name());
        return new AuthResponse(
                token, user.getRole().name(), user.getName(), user.getId(),
                user.getPlan().name(), user.getPlanExpiresAt()
        );
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (Exception e) {
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(
                token, user.getRole().name(), user.getName(), user.getId(),
                user.getPlan().name(), user.getPlanExpiresAt()
        );
    }
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Aucun compte associé à cet email"));

        // Génère un mot de passe temporaire lisible (12 chars)
        String chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
        SecureRandom random = new SecureRandom();
        String newPassword = IntStream.range(0, 12)
                .mapToObj(i -> String.valueOf(chars.charAt(random.nextInt(chars.length()))))
                .collect(Collectors.joining());

        // Hash et sauvegarde
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Envoie l'email
        emailService.sendPasswordResetEmail(email, user.getName(), newPassword);
    }
    public void changePassword(String email, String tempPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        // Vérifie que le mot de passe temporaire est correct
        if (!passwordEncoder.matches(tempPassword, user.getPassword())) {
            throw new RuntimeException("Mot de passe temporaire incorrect");
        }

        // Sauvegarde le nouveau
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}