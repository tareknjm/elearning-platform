package com.elearning.backend.dto;

import com.elearning.backend.model.Course;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class ChatResponse {
    private String reply;
    private List<CourseResponse> recommendations;
}