package com.elearning.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ElearningBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ElearningBackendApplication.class, args);
    }

}
