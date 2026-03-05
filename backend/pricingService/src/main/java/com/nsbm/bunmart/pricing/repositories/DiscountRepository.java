package com.nsbm.bunmart.pricing.repositories;

import com.nsbm.bunmart.pricing.model.Discount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiscountRepository extends JpaRepository<Discount, Long> {
    List<Discount> findByProductIdInAndIsActiveTrue(List<String> productIds);
    List<Discount> findByProductIdAndIsActiveTrueOrderByMinQuantityDesc(String productId);
}
