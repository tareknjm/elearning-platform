package com.elearning.backend.service;

import com.elearning.backend.dto.*;
import com.elearning.backend.model.*;
import com.elearning.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizResultRepository quizResultRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Transactional
    public QuizResponse createQuiz(QuizRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));

        Quiz quiz = Quiz.builder()
                .title(request.getTitle())
                .course(course)
                .build();

        List<QuizQuestion> questions = request.getQuestions().stream().map(qr -> {
            QuizQuestion question = QuizQuestion.builder()
                    .questionText(qr.getQuestionText())
                    .quiz(quiz)
                    .build();

            List<QuizOption> options = qr.getOptions().stream().map(or ->
                    QuizOption.builder()
                            .optionText(or.getOptionText())
                            .correct(or.isCorrect())
                            .question(question)
                            .build()
            ).collect(Collectors.toList());

            question.setOptions(options);
            return question;
        }).collect(Collectors.toList());

        quiz.setQuestions(questions);
        return QuizResponse.fromEntity(quizRepository.save(quiz));
    }

    @Transactional
    public QuizResponse getQuizByCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));

        Quiz quiz = quizRepository.findByCourse(course)
                .orElseThrow(() -> new RuntimeException("Aucun quiz pour cette formation"));

        return QuizResponse.fromEntity(quiz);
    }

    @Transactional
    public QuizResultResponse submitQuiz(Long quizId,
                                         QuizSubmitRequest request,
                                         String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz introuvable"));

        Map<Long, Long> answers = request.getAnswers();
        int correct = 0;
        int total = quiz.getQuestions().size();

        for (QuizQuestion question : quiz.getQuestions()) {
            Long chosenOptionId = answers.get(question.getId());
            if (chosenOptionId != null) {
                boolean isCorrect = question.getOptions().stream()
                        .anyMatch(o -> o.getId().equals(chosenOptionId) && o.isCorrect());
                if (isCorrect) correct++;
            }
        }

        int percent = total > 0 ? (correct * 100) / total : 0;
        boolean passed = percent >= 70;

        QuizResult result = QuizResult.builder()
                .user(user)
                .quiz(quiz)
                .score(correct)
                .totalQuestions(total)
                .passed(passed)
                .build();
        quizResultRepository.save(result);

        String message = passed
                ? "Félicitations ! Vous avez réussi le quiz avec " + percent + "% !"
                : "Score insuffisant (" + percent + "%). Il faut 70% pour obtenir le certificat.";

        return new QuizResultResponse(correct, total, percent, passed, message);
    }

    @Transactional
    public boolean hasPassed(Long courseId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));

        return quizRepository.findByCourse(course)
                .map(quiz -> quizResultRepository
                        .existsByUserAndQuizAndPassedTrue(user, quiz))
                .orElse(false);
    }
    @Transactional
    public int getLastScore(Long courseId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));

        return quizRepository.findByCourse(course)
                .map(quiz -> quizResultRepository
                        .findTopByUserAndQuizOrderByIdDesc(user, quiz)
                        .map(result -> result.getTotalQuestions() > 0
                                ? (result.getScore() * 100) / result.getTotalQuestions()
                                : 0)
                        .orElse(0))
                .orElse(0);
    }
}