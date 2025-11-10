package com.securebank.dto;

public class TokenDto {
    private final String access_token;
    private final String id_token;

    public TokenDto(String access_token, String id_token) {
        this.access_token = access_token;
        this.id_token = id_token;
    }

    public String getAccess_token() {
        return access_token;
    }

    public String getId_token() {
        return id_token;
    }
}
