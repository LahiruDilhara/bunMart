package com.nsbm.bunmart.pricing.services;

import com.nsbm.bunmart.pricing.interface_.IDiscountRuleService;
import com.nsbm.bunmart.pricing.model.DiscountRule;
import com.nsbm.bunmart.pricing.repositories.DiscountRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DiscountRuleService implements IDiscountRuleService {

    private final DiscountRuleRepository repo;

    @Override
    public DiscountRule create(DiscountRule d) { return repo.save(d); }

    @Override
    public DiscountRule getById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("DiscountRule not found: " + id));
    }

    @Override
    public List<DiscountRule> getAll() { return repo.findAll(); }

    @Override
    public DiscountRule update(Long id, DiscountRule d) {
        DiscountRule existing = getById(id);
        existing.setProductId(d.getProductId());
        existing.setCampaignId(d.getCampaignId());
        existing.setType(d.getType());
        existing.setValue(d.getValue());
        existing.setDescription(d.getDescription());
        existing.setIsActive(d.getIsActive());
        return repo.save(existing);
    }

    @Override
    public void delete(Long id) { repo.deleteById(id); }

    @Override
    public List<DiscountRule> getByProductIds(List<String> productIds) {
        return repo.findByProductIdInAndIsActiveTrue(productIds);
    }
}