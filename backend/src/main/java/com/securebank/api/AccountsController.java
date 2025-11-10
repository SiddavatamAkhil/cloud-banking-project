package com.securebank.api;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/accounts")
public class AccountsController {
  @GetMapping
  public List<Map<String,Object>> list(){
    return List.of(
      Map.of("id","CHK-2381","name","Checking","balance",2350.42,"currency","USD","owner", "Anonymous User"),
      Map.of("id","SAV-7712","name","Savings","balance",10890.00,"currency","USD","owner", "Anonymous User"),
      Map.of("id","CRD-9901","name","Credit Card","balance",-423.19,"currency","USD","owner", "Anonymous User")
    );
  }
}
