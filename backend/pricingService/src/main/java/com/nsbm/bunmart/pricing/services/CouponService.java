package com.nsbm.bunmart.pricing.services;

import com.nsbm.bunmart.pricing.errors.CouponNotFoundException;
import com.nsbm.bunmart.pricing.model.Coupon;
import com.nsbm.bunmart.pricing.repositories.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    public Coupon create(String code, String productId, Integer minQuantity, String type, BigDecimal value,
                         String description, BigDecimal minOrderAmount, Integer usageLimit, LocalDateTime expiresAt) {
        Coupon c = new Coupon();
        c.setCode(code);
        c.setProductId(productId);
        c.setMinQuantity(minQuantity);
        c.setType(type);
        c.setValue(value);
        c.setDescription(description);
        c.setMinOrderAmount(minOrderAmount != null ? minOrderAmount : BigDecimal.ZERO);
        c.setUsageLimit(usageLimit);
        c.setExpiresAt(expiresAt);
        return couponRepository.save(c);
    }

    public Coupon getById(Long id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new CouponNotFoundException("Coupon not found: " + id));
    }

    public List<Coupon> getAll() {
        return couponRepository.findAll();
    }

    public Optional<Coupon> findByCode(String code) {
        return couponRepository.findByCodeAndIsActiveTrue(code);
    }

    public Coupon update(Long id, String code, String productId, Integer minQuantity, String type, BigDecimal value,
                         String description, BigDecimal minOrderAmount, Integer usageLimit, Boolean isActive,
                         LocalDateTime expiresAt) {
        Coupon c = getById(id);
        if (code != null) c.setCode(code);
        if (productId != null) c.setProductId(productId);
        if (minQuantity != null) c.setMinQuantity(minQuantity);
        if (type != null) c.setType(type);
        if (value != null) c.setValue(value);
        if (description != null) c.setDescription(description);
        if (minOrderAmount != null) c.setMinOrderAmount(minOrderAmount);
        if (usageLimit != null) c.setUsageLimit(usageLimit);
        if (isActive != null) c.setIsActive(isActive);
        if (expiresAt != null) c.setExpiresAt(expiresAt);
        return couponRepository.save(c);
    }

    public void delete(Long id) {
        Coupon c = getById(id);
        couponRepository.delete(c);
    }
}
