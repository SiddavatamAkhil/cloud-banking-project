package com.securebank.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.securebank.dto.AuthResponse;
import com.securebank.dto.LoginRequest;
import com.securebank.dto.RegisterRequest;
import com.securebank.model.UserAccount;
import com.securebank.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody RegisterRequest request) {
        try {
            UserAccount created = userService.register(request.getName(), request.getEmail(), request.getPassword());
            AuthResponse response = new AuthResponse("no-token-needed", created.getName(), created.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            AuthResponse response = new AuthResponse("error", "Error: " + e.getMessage(), "");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signin(@Valid @RequestBody LoginRequest request) {
        try {
            // Simple email/password check without authentication manager
            UserAccount user = userService.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (!userService.matchesPassword(request.getPassword(), user.getPasswordHash())) {
                throw new RuntimeException("Invalid password");
            }
            
            AuthResponse response = new AuthResponse("no-token-needed", user.getName(), user.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AuthResponse response = new AuthResponse("error", "Error: " + e.getMessage(), "");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me() {
        // Return a dummy response since no authentication is required
        return ResponseEntity.ok(new AuthResponse("no-token-needed", "Anonymous User", "anonymous@example.com"));
    }
}
