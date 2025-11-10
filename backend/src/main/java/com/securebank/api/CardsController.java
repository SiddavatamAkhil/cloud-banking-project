package com.securebank.api;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cards")
public class CardsController {
  @PostMapping("/lock")
  public ResponseEntity<?> lock(@RequestParam String cardId, @RequestParam boolean lock){
    return ResponseEntity.ok(Map.of("cardId",cardId,"locked",lock,"requestedBy", "anonymous@example.com"));
  }
}

