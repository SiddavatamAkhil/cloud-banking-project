package com.securebank.api;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/statements")
public class StatementsController {
  @GetMapping
  public List<Map<String,String>> list(){
    return List.of(
      Map.of("month","2025-09","file","statement-2025-09.pdf"),
      Map.of("month","2025-08","file","statement-2025-08.pdf"),
      Map.of("month","2025-07","file","statement-2025-07.pdf")
    );
  }

  @GetMapping("/{file}")
  public ResponseEntity<?> download(@PathVariable String file){
    return ResponseEntity.ok(Map.of("download","stub:" + file, "requestedBy", "anonymous@example.com"));
  }
}
