package com.securebank.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @GetMapping("/me")
    public Map<String, Object> me() {
        return Map.of(
                "id", "anonymous",
                "email", "anonymous@example.com",
                "name", "Anonymous User"
        );
    }
}
