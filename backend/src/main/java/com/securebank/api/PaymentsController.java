package com.securebank.api;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/api/payments")
public class PaymentsController {

  @PostMapping("/transfer")
  public ResponseEntity<?> transfer(@RequestBody TransferReq req){
    Map<String, Object> body = new HashMap<>();
    body.put("status", "ok");
    body.put("from", req.getFrom());
    body.put("to", req.getTo());
    body.put("amount", req.getAmount());
    body.put("requestedBy", "anonymous@example.com");
    return ResponseEntity.ok(body);
  }
  public static class TransferReq {
    @NotBlank
    private String from;
    @NotBlank
    private String to;
    @Positive
    private double amount;

    public TransferReq() {}

    public TransferReq(String from, String to, double amount) {
      this.from = from;
      this.to = to;
      this.amount = amount;
    }

    public String getFrom() { return from; }
    public String getTo() { return to; }
    public double getAmount() { return amount; }
  }
}
