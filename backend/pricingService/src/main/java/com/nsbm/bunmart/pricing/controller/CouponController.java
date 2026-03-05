package com.nsbm.bunmart.pricing.controller;

import com.nsbm.bunmart.pricing.dto.CouponResponseDTO;
import com.nsbm.bunmart.pricing.dto.CreateCouponRequestDTO;
import com.nsbm.bunmart.pricing.dto.UpdateCouponRequestDTO;
import com.nsbm.bunmart.pricing.mappers.rest.PricingMapper;
import com.nsbm.bunmart.pricing.model.Coupon;
import com.nsbm.bunmart.pricing.services.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/pricing/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;
    private final PricingMapper pricingMapper;

    @PostMapping
    public ResponseEntity<CouponResponseDTO> create(@Valid @RequestBody CreateCouponRequestDTO dto) {
        Coupon c = couponService.create(
                dto.getCode(),
                dto.getProductId(),
                dto.getMinQuantity(),
                dto.getType(),
                dto.getValue(),
                dto.getDescription(),
                dto.getMinOrderAmount(),
                dto.getUsageLimit(),
                dto.getExpiresAt()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(pricingMapper.toCouponResponseDTO(c));
    }

    @GetMapping
    public List<CouponResponseDTO> getAll() {
        return couponService.getAll().stream()
                .map(pricingMapper::toCouponResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CouponResponseDTO> getById(@PathVariable Long id) {
        Coupon c = couponService.getById(id);
        return ResponseEntity.ok(pricingMapper.toCouponResponseDTO(c));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CouponResponseDTO> update(@PathVariable Long id, @Valid @RequestBody UpdateCouponRequestDTO dto) {
        Coupon c = couponService.update(
                id,
                dto.getCode(),
                dto.getProductId(),
                dto.getMinQuantity(),
                dto.getType(),
                dto.getValue(),
                dto.getDescription(),
                dto.getMinOrderAmount(),
                dto.getUsageLimit(),
                dto.getIsActive(),
                dto.getExpiresAt()
        );
        return ResponseEntity.ok(pricingMapper.toCouponResponseDTO(c));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        couponService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
