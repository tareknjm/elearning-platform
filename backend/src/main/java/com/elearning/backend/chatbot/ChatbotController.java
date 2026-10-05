package com.elearning.backend.chatbot;

import com.elearning.backend.dto.ChatRequest;
import com.elearning.backend.dto.ChatResponse;
import com.elearning.backend.model.ChatMessage;
import com.elearning.backend.model.User;
import com.elearning.backend.repository.ChatMessageRepository;
import com.elearning.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    @PostMapping("/message")
    public ResponseEntity<ChatResponse> sendMessage(
            @RequestBody ChatRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                chatbotService.processMessage(request, authentication));
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChatMessage>> getHistory(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        return ResponseEntity.ok(
                chatMessageRepository.findByUserOrderByTimestampAsc(user));
    }
}