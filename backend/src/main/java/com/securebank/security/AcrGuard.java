package com.securebank.security;

import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class AcrGuard {
  public void requireAal2(Jwt jwt){
    String acr = (String) jwt.getClaims().getOrDefault("acr","urn:bank:aal:1");
    if (!"urn:bank:aal:2".equals(acr) && !"urn:bank:aal:3".equals(acr)) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "AAL2 required");
    }
  }
}
