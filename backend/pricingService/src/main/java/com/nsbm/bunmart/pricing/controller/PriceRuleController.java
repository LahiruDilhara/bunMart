package com.nsbm.bunmart.pricing.controller;

import com.nsbm.bunmart.pricing.model.PriceRule;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/prices")
@RequiredArgsConstructor
public class PriceRuleController {

    private final IPriceRuleService service;

    @PostMapping
    public ResponseEntity<PriceRule> create(@RequestBody PriceRule priceRule) {
        return ResponseEntity.ok(service.create(priceRule));
    }

    @GetMapping
    public ResponseEntity<List<PriceRule>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<PriceRule>> getByProductId(@PathVariable String productId) {
        return ResponseEntity.ok(service.getByProductIds(List.of(productId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PriceRule> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PriceRule> update(@PathVariable Long id, @RequestBody PriceRule priceRule) {
        return ResponseEntity.ok(service.update(id, priceRule));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}