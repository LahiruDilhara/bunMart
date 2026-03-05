package com.nsbm.bunmart.pricing.repositories;

import com.nsbm.bunmart.pricing.model.PriceRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PriceRuleRepository extends JpaRepository<PriceRule, Long> {

    List<PriceRule> findByProductIdInAndIsActiveTrue(List<String> productIds);

    List<PriceRule> findByProductIdAndIsActiveTrue(String productId);

    // Safe method that returns the most recent price rule
    default Optional<PriceRule> findActivePriceRule(String productId) {
        List<PriceRule> rules = findByProductIdAndIsActiveTrue(productId);
        if (rules.isEmpty()) {
            return Optional.empty();
        }
        // Return the most recently updated one
        rules.sort((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()));
        return Optional.of(rules.get(0));
    }

    // Fixed query - removed the problematic subquery
    @Query("SELECT p FROM PriceRule p WHERE p.productId IN :productIds AND p.isActive = true")
    List<PriceRule> findLatestByProductIdInAndIsActiveTrue(@Param("productIds") List<String> productIds);
}