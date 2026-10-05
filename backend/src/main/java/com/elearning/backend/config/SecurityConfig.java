package com.elearning.backend.config;

import com.elearning.backend.security.JwtFilter;
import com.elearning.backend.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final UserDetailsServiceImpl userDetailsService;
    private final CorsConfig corsConfig;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfig.corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/courses/**").permitAll()
                        .requestMatchers("/api/courses/*/archive", "/api/courses/*/restore").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers("/api/categories/**").hasRole("ADMIN")
                        .requestMatchers("/api/videos/**").permitAll()
                        .requestMatchers("/api/chat/**").permitAll()
                        .requestMatchers("/api/applications/instructor").permitAll()
                        .requestMatchers("/api/admin/videos/**").hasRole("ADMIN")
                        .requestMatchers("/api/subscription/**").authenticated()
                        .requestMatchers("/videos/**").permitAll()
                        .requestMatchers("/api/instructor/availability").authenticated()
                        .requestMatchers("/api/instructor/video-calls/**").authenticated()
                        .requestMatchers("/api/instructor/absences/**").authenticated()
                        .requestMatchers("/api/learner/video-calls/**").authenticated()
                        .requestMatchers("/api/admin/absences/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/penalties/**").hasRole("ADMIN")
                        .requestMatchers("/uploads/certificates/**").authenticated()
                        .requestMatchers("/api/video-calls/**").authenticated()
                        .requestMatchers("/images/**").permitAll()
                        .requestMatchers("/api/courses/*/quiz").permitAll()
                        .requestMatchers("/api/courses/*/ratings").permitAll()
                        .requestMatchers("/api/notifications/**").authenticated()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/applications/instructor",
                                "/error"
                        ).permitAll()
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/applications/instructor",
                                "/uploads/motivations/**",
                                "/error"
                        ).permitAll()
                        .requestMatchers("/api/auth/forgot-password").permitAll()
                        .requestMatchers("/api/auth/change-password").permitAll()
                        .requestMatchers("/api/instructor/**").hasRole("INSTRUCTOR")
                        .requestMatchers("/api/instructor/category-requests/**").hasRole("INSTRUCTOR")
                        .requestMatchers("/api/admin/category-requests/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .userDetailsService(userDetailsService)
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}