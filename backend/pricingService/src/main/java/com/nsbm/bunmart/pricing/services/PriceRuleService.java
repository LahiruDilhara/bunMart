package com.nsbm.bunmart.pricing.services;

import com.nsbm.bunmart.pricing.model.PriceRule;
import com.nsbm.bunmart.pricing.interfaces.IPriceRuleService;
import com.nsbm.bunmart.pricing.repositories.PriceRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class PriceRuleService implements IPriceRuleService {

    private static final Logger log = LoggerFactory.getLogger(PriceRuleService.class);
    private final PriceRuleRepository repository;

    @Override
    public PriceRule create(PriceRule priceRule) {
        try {
            log.info("Creating price rule for product: {}", priceRule.getProductId());
            return repository.save(priceRule);
        } catch (Exception e) {
            log.error("Error creating price rule", e);
            throw new RuntimeException("Failed to create price rule: " + e.getMessage(), e);
        }
    }

    @Override
    public PriceRule getById(Long id) {
        try {
            log.info("Fetching price rule by id: {}", id);
            return repository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Price rule not found with id: " + id));
        } catch (Exception e) {
            log.error("Error fetching price rule by id: {}", id, e);
            throw new RuntimeException("Failed to fetch price rule: " + e.getMessage(), e);
        }
    }

    @Override
    public List<PriceRule> getAll() {
        try {
            log.info("Fetching all price rules");
            List<PriceRule> rules = repository.findAll();
            log.info("Found {} price rules", rules.size());
            return rules;
        } catch (Exception e) {
            log.error("Error fetching all price rules", e);
            throw new RuntimeException("Failed to fetch price rules: " + e.getMessage(), e);
        }
    }

    @Override
    public PriceRule update(Long id, PriceRule priceRule) {
        try {
            log.info("Updating price rule with id: {}", id);
            PriceRule existing = getById(id);
            existing.setProductId(priceRule.getProductId());
            existing.setUnitPrice(priceRule.getUnitPrice());
            existing.setCurrencyCode(priceRule.getCurrencyCode());
            existing.setIsActive(priceRule.getIsActive());
            return repository.save(existing);
        } catch (Exception e) {
            log.error("Error updating price rule with id: {}", id, e);
            throw new RuntimeException("Failed to update price rule: " + e.getMessage(), e);
        }
    }

    @Override
    public void delete(Long id) {
        try {
            log.info("Deleting price rule with id: {}", id);
            repository.deleteById(id);
        } catch (Exception e) {
            log.error("Error deleting price rule with id: {}", id, e);
            throw new RuntimeException("Failed to delete price rule: " + e.getMessage(), e);
        }
    }

    @Override
    public List<PriceRule> getByProductIds(List<String> productIds) {
        try {
            log.info("Fetching price rules for product ids: {}", productIds);

            if (productIds == null || productIds.isEmpty()) {
                log.warn("Product IDs list is null or empty");
                return new ArrayList<>();
            }

            // Log each product ID for debugging
            for (String productId : productIds) {
                log.debug("Processing product ID: {}", productId);
            }

            List<PriceRule> rules = repository.findByProductIdInAndIsActiveTrue(productIds);
            log.info("Found {} price rules for product ids", rules != null ? rules.size() : 0);

            if (rules != null) {
                for (PriceRule rule : rules) {
                    log.debug("Found rule - ID: {}, Product: {}, Price: {}",
                            rule.getId(), rule.getProductId(), rule.getUnitPrice());
                }
            }

            return rules != null ? rules : new ArrayList<>();

        } catch (Exception e) {
            log.error("Error fetching price rules by product ids: {}", productIds, e);
            // Log the full stack trace
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch price rules by product ids: " + e.getMessage(), e);
        }
    }
}