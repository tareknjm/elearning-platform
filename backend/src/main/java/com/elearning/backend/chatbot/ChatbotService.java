package com.elearning.backend.chatbot;

import com.elearning.backend.dto.ChatRequest;
import com.elearning.backend.dto.ChatResponse;
import com.elearning.backend.dto.CourseResponse;
import com.elearning.backend.model.ChatMessage;
import com.elearning.backend.model.Course;
import com.elearning.backend.model.User;
import com.elearning.backend.repository.ChatMessageRepository;
import com.elearning.backend.repository.CourseRepository;
import com.elearning.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatbotService {

    private final CourseRepository courseRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final GroqChatClient groqChatClient;

    // Mots-clés → catégories/sujets
    private static final Map<String, List<String>> KEYWORDS = new HashMap<>();

    static {
        KEYWORDS.put("java", List.of("java", "spring", "backend", "jee"));
        KEYWORDS.put("python", List.of("python", "django", "flask", "data", "ia", "machine learning"));
        KEYWORDS.put("web", List.of("html", "css", "javascript", "react", "angular", "vue", "frontend"));
        KEYWORDS.put("mobile", List.of("android", "ios", "flutter", "react native", "mobile"));
        KEYWORDS.put("base de données", List.of("sql", "mysql", "mongodb", "database", "données"));
        KEYWORDS.put("devops", List.of("docker", "kubernetes", "ci/cd", "linux", "aws", "cloud"));
        KEYWORDS.put("sécurité", List.of("security", "cybersécurité", "hacking", "pentest"));
        KEYWORDS.put("design", List.of("ui", "ux", "figma", "design", "interface"));
    }

    public ChatResponse processMessage(ChatRequest request, Authentication authentication) {
        String message = request.getMessage().toLowerCase().trim();
        List<Course> allApproved = courseRepository.findByStatus(Course.Status.APPROVED);

        List<Course> matched = findMatchingCourses(message, allApproved);

        String reply = generateAiReply(request.getMessage(), matched);

        if (authentication != null) {
            saveMessage(message, reply, authentication.getName());
        }

        List<CourseResponse> recommendations = matched.stream()
                .limit(4)
                .map(CourseResponse::fromEntity)
                .collect(Collectors.toList());

        return new ChatResponse(reply, recommendations);
    }

    private String generateAiReply(String userMessage, List<Course> matched) {
        String coursesContext = matched.isEmpty()
                ? "Aucune formation ne correspond exactement a cette demande dans le catalogue."
                : matched.stream()
                .limit(4)
                .map(c -> "- " + c.getTitle() + ": " + c.getDescription())
                .collect(Collectors.joining("\n"));

        String systemPrompt = """
                Tu es l'assistant conversationnel d'une plateforme e-learning.
                Reponds toujours en francais, de facon breve (2 a 4 phrases), chaleureuse et naturelle.
                Si des formations pertinentes existent dans le contexte ci-dessous, mentionne-les.
                Sinon, propose a l'utilisateur de preciser sa demande (ex: Java, Python, Web, Mobile, SQL, Docker...).

                Formations trouvees dans le catalogue:
                %s
                """.formatted(coursesContext);

        try {
            return groqChatClient.ask(systemPrompt, userMessage);
        } catch (Exception e) {
            System.err.println("Erreur appel Groq, fallback sur reponse basique: " + e.getMessage());
            return generateReply(userMessage.toLowerCase(), matched);
        }
    }

    private List<Course> findMatchingCourses(String message, List<Course> courses) {
        List<Course> matched = new ArrayList<>();

        for (Course course : courses) {
            String courseText = (course.getTitle() + " " +
                    (course.getDescription() != null ? course.getDescription() : "") + " " +
                    (course.getCategory() != null ? course.getCategory().getName() : ""))
                    .toLowerCase();

            String[] words = message.split("\\s+");
            for (String word : words) {
                if (word.length() > 2 && courseText.contains(word)) {
                    if (!matched.contains(course)) {
                        matched.add(course);
                    }
                }
            }

            for (Map.Entry<String, List<String>> entry : KEYWORDS.entrySet()) {
                for (String keyword : entry.getValue()) {
                    if (message.contains(keyword) && courseText.contains(keyword)) {
                        if (!matched.contains(course)) {
                            matched.add(course);
                        }
                    }
                }
            }
        }

        return matched;
    }

    private String generateReply(String message, List<Course> matched) {
        if (message.matches(".*(bonjour|salut|hello|bonsoir|hi).*")) {
            return "Bonjour ! 👋 Je suis votre assistant E-Learning. Dites-moi ce que vous souhaitez apprendre et je vous recommanderai les meilleures formations !";
        }

        if (message.matches(".*(aide|help|comment|quoi).*")) {
            return "Je peux vous aider à trouver des formations ! Dites-moi simplement ce que vous voulez apprendre. Par exemple : \"Je veux apprendre Java\", \"formations en Python\", \"développement web\"...";
        }

        if (message.matches(".*(merci|thank|super|parfait|excellent).*")) {
            return "Avec plaisir ! 😊 N'hésitez pas si vous avez d'autres questions ou si vous cherchez d'autres formations.";
        }

        if (!matched.isEmpty()) {
            return "J'ai trouvé " + matched.size() + " formation(s) qui correspond(ent) à votre recherche ! 🎯 Voici mes recommandations :";
        }

        return "Je n'ai pas trouvé de formation correspondant exactement à \"" + message + "\". 🤔 Essayez avec d'autres mots-clés comme : Java, Python, Web, Mobile, SQL, Docker...";
    }

    private void saveMessage(String message, String reply, String userEmail) {
        try {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            ChatMessage chatMessage = ChatMessage.builder()
                    .user(user)
                    .message(message)
                    .response(reply)
                    .build();
            chatMessageRepository.save(chatMessage);
        } catch (Exception e) {
            System.err.println("Erreur sauvegarde chat: " + e.getMessage());
        }
    }
}