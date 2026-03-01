package com.nsbm.bunmart.pricing.controller;

import com.nsbm.bunmart.pricing.interface_.IDiscountRuleService;
import com.nsbm.bunmart.pricing.model.DiscountRule;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/discounts")
@RequiredArgsConstructor
public class DiscountController {

    private final IDiscountRuleService service;

    @PostMapping
    public ResponseEntity<DiscountRule> create(@RequestBody DiscountRule discountRule) {
        return ResponseEntity.ok(service.create(discountRule));
    }

    @GetMapping
    public ResponseEntity<List<DiscountRule>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiscountRule> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiscountRule> update(@PathVariable Long id, @RequestBody DiscountRule discountRule) {
        return ResponseEntity.ok(service.update(id, discountRule));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}