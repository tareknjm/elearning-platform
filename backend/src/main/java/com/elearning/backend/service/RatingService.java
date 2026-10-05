package com.elearning.backend.service;

import com.elearning.backend.dto.*;
import com.elearning.backend.model.*;
import com.elearning.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Transactional
    public RatingResponse addOrUpdateRating(Long courseId,
                                            RatingRequest request,
                                            String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));

        if (!enrollmentRepository.existsByUserAndCourse(user, course)) {
            throw new RuntimeException("Vous devez etre inscrit pour noter");
        }

        if (request.getStars() < 1 || request.getStars() > 5) {
            throw new RuntimeException("La note doit etre entre 1 et 5");
        }

        Rating rating = ratingRepository.findByUserAndCourse(user, course)
                .orElse(Rating.builder().user(user).course(course).build());

        rating.setStars(request.getStars());
        rating.setComment(request.getComment());

        return RatingResponse.fromEntity(ratingRepository.save(rating));
    }

    public CourseRatingStats getRatingStats(Long courseId, String userEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));

        List<RatingResponse> reviews = ratingRepository
                .findByCourseOrderByCreatedAtDesc(course)
                .stream()
                .map(RatingResponse::fromEntity)
                .collect(Collectors.toList());

        Double avg = ratingRepository.findAverageStarsByCourse(course);
        long total = ratingRepository.countByCourse(course);
        double average = avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;

        boolean userHasRated = false;
        int userRating = 0;
        String userComment = "";

        if (userEmail != null) {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            if (user != null) {
                var existing = ratingRepository.findByUserAndCourse(user, course);
                if (existing.isPresent()) {
                    userHasRated = true;
                    userRating = existing.get().getStars();
                    userComment = existing.get().getComment() != null
                            ? existing.get().getComment() : "";
                }
            }
        }

        return new CourseRatingStats(average, total, reviews,
                userHasRated, userRating, userComment);
    }
}