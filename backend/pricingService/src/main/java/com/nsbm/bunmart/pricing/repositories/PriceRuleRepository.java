package com.nsbm.bunmart.pricing.repositories;

import com.nsbm.bunmart.pricing.model.PriceRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface PriceRuleRepository extends JpaRepository<PriceRule, Long> {

    // Original method - returns List to handle multiple results
    List<PriceRule> findByProductIdInAndIsActiveTrue(List<String> productIds);

    // Modified to return List instead of Optional
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

    // Get all active prices for products with latest version
    @Query("SELECT p FROM PriceRule p WHERE p.productId IN :productIds AND p.isActive = true " +
            "AND p.updatedAt = (SELECT MAX(p2.updatedAt) FROM PriceRule p2 WHERE p2.productId = p.productId AND p2.isActive = true)")
    List<PriceRule> findLatestByProductIdInAndIsActiveTrue(@Param("productIds") List<String> productIds);
}