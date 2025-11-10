package com.securebank.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {

    @Email(message = "Email must be valid")
    @NotBlank(message = "Email is required")
    @Size(max = 191, message = "Email must not exceed 191 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 1, max = 128, message = "Password must not exceed 128 characters")
    private String password;
}
