package com.securebank.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/public")
    public ResponseEntity<Map<String, String>> publicEndpoint() {
        return ResponseEntity.ok(Map.of(
            "message", "This is a public endpoint - no restrictions!",
            "status", "success"
        ));
    }

    @GetMapping("/protected")
    public ResponseEntity<Map<String, Object>> protectedEndpoint() {
        return ResponseEntity.ok(Map.of(
            "message", "This endpoint is now completely open - no authentication required!",
            "user", Map.of(
                "id", "anonymous",
                "name", "Anonymous User",
                "email", "anonymous@example.com"
            ),
            "status", "success"
        ));
    }
}