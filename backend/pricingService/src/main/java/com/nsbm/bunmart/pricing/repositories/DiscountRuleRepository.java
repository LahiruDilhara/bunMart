package com.nsbm.bunmart.pricing.repositories;

import com.nsbm.bunmart.pricing.model.DiscountRule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DiscountRuleRepository extends JpaRepository<DiscountRule, Long> {
    List<DiscountRule> findByProductIdInAndIsActiveTrue(List<String> productIds);
    List<DiscountRule> findByProductIdAndIsActiveTrue(String productId);
}