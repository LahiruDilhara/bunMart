package com.nsbm.bunmart.pricing.repositories;

import com.nsbm.bunmart.pricing.model.PriceRule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PriceRuleRepository extends JpaRepository<PriceRule, Long> {
    List<PriceRule> findByProductIdInAndIsActiveTrue(List<String> productIds);
    Optional<PriceRule> findByProductIdAndIsActiveTrue(String productId);
}