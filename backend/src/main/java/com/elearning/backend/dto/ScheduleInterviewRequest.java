package com.elearning.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ScheduleInterviewRequest {
    private LocalDateTime interviewDateTime;
}