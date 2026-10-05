package com.elearning.backend.service;

import com.elearning.backend.dto.InstructorAnalytics;
import com.elearning.backend.model.*;
import com.elearning.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final VideoRepository videoRepository;
    private final VideoProgressRepository videoProgressRepository;
    private final RatingRepository ratingRepository;

    public InstructorAnalytics getAnalytics(String instructorEmail) {
        User instructor = userRepository.findByEmail(instructorEmail)
                .orElseThrow(() -> new RuntimeException("Instructeur introuvable"));

        List<Course> courses = courseRepository.findByInstructor(instructor);

        List<InstructorAnalytics.CourseAnalytics> courseStats = courses.stream()
                .map(course -> buildCourseAnalytics(course))
                .collect(Collectors.toList());

        int finalTotalStudents = courseStats.stream()
                .mapToInt(InstructorAnalytics.CourseAnalytics::getEnrollments)
                .sum();

        double globalAvg = courseStats.stream()
                .filter(c -> c.getAverageRating() > 0)
                .mapToDouble(InstructorAnalytics.CourseAnalytics::getAverageRating)
                .average()
                .orElse(0.0);

        int finalTotalVideos = courseStats.stream()
                .mapToInt(c -> c.getVideoStats().size())
                .sum();

        return new InstructorAnalytics(
                courses.size(),
                finalTotalStudents,
                Math.round(globalAvg * 10.0) / 10.0,
                finalTotalVideos,
                courseStats
        );
    }

    private InstructorAnalytics.CourseAnalytics buildCourseAnalytics(Course course) {

        // Inscriptions
        List<Enrollment> enrollments = enrollmentRepository.findByCourse(course);
        int enrolled = enrollments.size();

        // Vidéos
        List<Video> videos = videoRepository.findByCourseOrderByOrderIndexAsc(course);
        int videoCount = videos.size();

        // Completions
        int completions = 0;
        if (videoCount > 0) {
            for (Enrollment e : enrollments) {
                long watched = videoProgressRepository
                        .countByUserAndCourseAndWatched(e.getUser(), course, true);
                if (watched >= videoCount) {
                    completions++;
                }
            }
        }

        double completionRate = enrolled > 0
                ? Math.round((completions * 100.0 / enrolled) * 10) / 10.0
                : 0.0;

        // Note moyenne
        Double avg = ratingRepository.findAverageStarsByCourse(course);
        long totalRatings = ratingRepository.countByCourse(course);
        double avgRating = avg != null
                ? Math.round(avg * 10.0) / 10.0
                : 0.0;

        // Stats vidéos
        List<InstructorAnalytics.VideoStats> videoStats = videos.stream()
                .map(v -> buildVideoStats(v))
                .collect(Collectors.toList());

        return new InstructorAnalytics.CourseAnalytics(
                course.getId(),
                course.getTitle(),
                enrolled,
                completions,
                completionRate,
                avgRating,
                totalRatings,
                videoStats
        );
    }

    private InstructorAnalytics.VideoStats buildVideoStats(Video video) {
        long views = videoProgressRepository.countByVideoAndWatched(video, true);
        return new InstructorAnalytics.VideoStats(
                video.getId(),
                video.getTitle(),
                video.getOrderIndex(),
                views
        );
    }
}