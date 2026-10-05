package com.elearning.backend.chatbot;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Component
public class GroqChatClient {

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.model:llama-3.1-8b-instant}")
    private String model;

    public String ask(String systemPrompt, String userMessage) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        GroqDto.Request body = new GroqDto.Request(
                model,
                List.of(
                        new GroqDto.Message("system", systemPrompt),
                        new GroqDto.Message("user", userMessage)
                ),
                0.6,
                400
        );

        HttpEntity<GroqDto.Request> entity = new HttpEntity<>(body, headers);
        GroqDto.Response response = restTemplate.postForObject(GROQ_URL, entity, GroqDto.Response.class);

        if (response == null || response.getChoices() == null || response.getChoices().isEmpty()) {
            throw new IllegalStateException("Réponse Groq vide");
        }
        return response.getChoices().get(0).getMessage().getContent();
    }
}