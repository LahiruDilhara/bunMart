package com.nsbm.bunmart.pricing.controller;

import com.nsbm.bunmart.pricing.model.Coupon;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final ICouponService service;

    @PostMapping
    public ResponseEntity<Coupon> create(@RequestBody Coupon coupon) {
        return ResponseEntity.ok(service.create(coupon));
    }

    @GetMapping
    public ResponseEntity<List<Coupon>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Coupon> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Coupon> update(@PathVariable Long id, @RequestBody Coupon coupon) {
        return ResponseEntity.ok(service.update(id, coupon));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}