package com.elearning.backend.chatbot;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class GroqDto {

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class Message {
        private String role;
        private String content;
    }

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class Request {
        private String model;
        private List<Message> messages;
        private double temperature;
        @JsonProperty("max_tokens")
        private int maxTokens;
    }

    @Data @NoArgsConstructor
    public static class Response {
        private List<Choice> choices;

        @Data @NoArgsConstructor
        public static class Choice {
            private Message message;
        }
    }
}