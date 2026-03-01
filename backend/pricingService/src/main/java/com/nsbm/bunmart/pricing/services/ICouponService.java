package com.nsbm.bunmart.pricing.interface_;

import com.nsbm.bunmart.pricing.model.Coupon;
import java.util.List;
import java.util.Optional;

public interface ICouponService {
    Coupon create(Coupon coupon);
    Coupon getById(String id);
    List<Coupon> getAll();
    Coupon update(String id, Coupon coupon);
    void delete(String id);
    Optional<Coupon> findByCode(String code);
}