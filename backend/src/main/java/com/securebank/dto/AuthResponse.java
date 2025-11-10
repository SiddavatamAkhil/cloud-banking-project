package com.securebank.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private String name;
    private String email;

    public AuthResponse(String accessToken, String name, String email) {
        this.accessToken = accessToken;
        this.name = name;
        this.email = email;
    }
}
