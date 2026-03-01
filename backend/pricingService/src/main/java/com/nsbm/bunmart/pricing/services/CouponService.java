package com.nsbm.bunmart.pricing.services;

import com.nsbm.bunmart.pricing.interface_.ICouponService;
import com.nsbm.bunmart.pricing.model.Coupon;
import com.nsbm.bunmart.pricing.repositories.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CouponService implements ICouponService {

    private final CouponRepository repo;

    @Override
    public Coupon create(Coupon c) { return repo.save(c); }

    @Override
    public Coupon getById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Coupon not found: " + id));
    }

    @Override
    public List<Coupon> getAll() { return repo.findAll(); }

    @Override
    public Coupon update(Long id, Coupon c) {
        Coupon existing = getById(id);
        existing.setCode(c.getCode());
        existing.setType(c.getType());
        existing.setValue(c.getValue());
        existing.setDescription(c.getDescription());
        existing.setMinOrderAmount(c.getMinOrderAmount());
        existing.setUsageLimit(c.getUsageLimit());
        existing.setIsActive(c.getIsActive());
        existing.setExpiresAt(c.getExpiresAt());
        return repo.save(existing);
    }

    @Override
    public void delete(Long id) { repo.deleteById(id); }

    @Override
    public Optional<Coupon> findByCode(String code) {
        return repo.findByCodeAndIsActiveTrue(code);
    }
}