package com.nsbm.bunmart.pricing.services;

import com.nsbm.bunmart.pricing.model.Coupon;
import com.nsbm.bunmart.pricing.interfaces.ICouponService;  // Fixed import
import com.nsbm.bunmart.pricing.repositories.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CouponService implements ICouponService {

    private final CouponRepository repository;

    @Override
    public Coupon create(Coupon coupon) {
        return repository.save(coupon);
    }

    @Override
    public Coupon getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found with id: " + id));
    }

    @Override
    public List<Coupon> getAll() {
        return repository.findAll();
    }

    @Override
    public Coupon update(Long id, Coupon coupon) {
        Coupon existing = getById(id);
        existing.setCode(coupon.getCode());
        existing.setType(coupon.getType());
        existing.setValue(coupon.getValue());
        existing.setDescription(coupon.getDescription());
        existing.setMinOrderAmount(coupon.getMinOrderAmount());
        existing.setExpiresAt(coupon.getExpiresAt());
        existing.setUsageLimit(coupon.getUsageLimit());
        existing.setIsActive(coupon.getIsActive());
        return repository.save(existing);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Override
    public Optional<Coupon> findByCode(String code) {
        return repository.findByCodeAndIsActiveTrue(code);
    }
}