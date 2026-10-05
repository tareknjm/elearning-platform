package com.elearning.backend.controller;

import com.elearning.backend.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/learner")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @GetMapping("/courses/{courseId}/certificate")
    public ResponseEntity<byte[]> getCertificate(
            @PathVariable Long courseId,
            Authentication authentication) {
        try {
            byte[] pdf = certificateService.generateCertificate(
                    courseId, authentication.getName());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(
                    ContentDisposition.attachment()
                            .filename("certificat.pdf")
                            .build());

            return ResponseEntity.ok().headers(headers).body(pdf);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}