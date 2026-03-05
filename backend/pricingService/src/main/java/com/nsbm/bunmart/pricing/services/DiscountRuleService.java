package com.nsbm.bunmart.pricing.services;

import com.nsbm.bunmart.pricing.model.DiscountRule;
import com.nsbm.bunmart.pricing.interfaces.IDiscountRuleService;
import com.nsbm.bunmart.pricing.repositories.DiscountRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DiscountRuleService implements IDiscountRuleService {

    private final DiscountRuleRepository repository;

    @Override
    public DiscountRule create(DiscountRule discountRule) {
        return repository.save(discountRule);
    }

    @Override
    public DiscountRule getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Discount rule not found with id: " + id));
    }

    @Override
    public List<DiscountRule> getAll() {
        return repository.findAll();
    }

    @Override
    public DiscountRule update(Long id, DiscountRule discountRule) {
        DiscountRule existing = getById(id);
        existing.setType(discountRule.getType());
        existing.setValue(discountRule.getValue());
        existing.setDescription(discountRule.getDescription());
        existing.setIsActive(discountRule.getIsActive());
        existing.setProductId(discountRule.getProductId());
        existing.setCampaignId(discountRule.getCampaignId());
        return repository.save(existing);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Override
    public List<DiscountRule> getByProductIds(List<String> productIds) {
        return repository.findByProductIdInAndIsActiveTrue(productIds);
    }
}