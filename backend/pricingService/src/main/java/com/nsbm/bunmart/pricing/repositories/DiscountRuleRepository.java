package com.nsbm.bunmart.pricing.repositories;

import com.nsbm.bunmart.pricing.model.DiscountRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DiscountRuleRepository extends JpaRepository<DiscountRule, Long> {

    List<DiscountRule> findByProductIdInAndIsActiveTrue(List<String> productIds);

    List<DiscountRule> findByProductIdAndIsActiveTrue(String productId);
}