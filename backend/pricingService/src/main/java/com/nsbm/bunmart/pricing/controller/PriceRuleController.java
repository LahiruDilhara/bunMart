package com.nsbm.bunmart.pricing.controller;

import com.nsbm.bunmart.pricing.model.PriceRule;
import com.nsbm.bunmart.pricing.interfaces.IPriceRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/price-rules")
@RequiredArgsConstructor
public class PriceRuleController {

    private static final Logger log = LoggerFactory.getLogger(PriceRuleController.class);
    private final IPriceRuleService service;

    @PostMapping
    public ResponseEntity<PriceRule> create(@RequestBody PriceRule priceRule) {
        try {
            log.info("Creating price rule for product: {}", priceRule.getProductId());
            return ResponseEntity.ok(service.create(priceRule));
        } catch (Exception e) {
            log.error("Error creating price rule", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<PriceRule>> getAll() {
        try {
            log.info("Fetching all price rules");
            List<PriceRule> rules = service.getAll();
            if (rules == null) {
                rules = new ArrayList<>();
            }
            log.info("Found {} price rules", rules.size());
            return ResponseEntity.ok(rules);
        } catch (Exception e) {
            log.error("Error fetching price rules", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<PriceRule> getById(@PathVariable Long id) {
        try {
            log.info("Fetching price rule by id: {}", id);
            PriceRule rule = service.getById(id);
            return ResponseEntity.ok(rule);
        } catch (Exception e) {
            log.error("Error fetching price rule with id: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<PriceRule> update(@PathVariable Long id, @RequestBody PriceRule priceRule) {
        try {
            log.info("Updating price rule with id: {}", id);
            return ResponseEntity.ok(service.update(id, priceRule));
        } catch (Exception e) {
            log.error("Error updating price rule with id: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            log.info("Deleting price rule with id: {}", id);
            service.delete(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting price rule with id: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/by-product-ids")
    public ResponseEntity<List<PriceRule>> getByProductIds(@RequestBody List<String> productIds) {
        try {
            log.info("Fetching price rules for product ids: {}", productIds);
            if (productIds == null || productIds.isEmpty()) {
                return ResponseEntity.ok(new ArrayList<>());
            }
            List<PriceRule> rules = service.getByProductIds(productIds);
            return ResponseEntity.ok(rules != null ? rules : new ArrayList<>());
        } catch (Exception e) {
            log.error("Error fetching price rules by product ids", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}