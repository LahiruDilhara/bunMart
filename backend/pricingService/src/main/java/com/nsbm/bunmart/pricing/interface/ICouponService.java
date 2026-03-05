package com.nsbm.bunmart.pricing.interfaces;

import com.nsbm.bunmart.pricing.model.Coupon;
import java.util.List;
import java.util.Optional;

public interface ICouponService {
    Coupon create(Coupon coupon);
    Coupon getById(Long id);
    List<Coupon> getAll();
    Coupon update(Long id, Coupon coupon);
    void delete(Long id);
    Optional<Coupon> findByCode(String code);
}