package com.nsbm.bunmart.pricing.services;

import com.nsbm.bunmart.pricing.interface_.IPriceRuleService;
import com.nsbm.bunmart.pricing.model.PriceRule;
import com.nsbm.bunmart.pricing.repositories.PriceRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PriceRuleService implements IPriceRuleService {

    private final PriceRuleRepository repo;

    @Override
    public PriceRule create(PriceRule p) { return repo.save(p); }

    @Override
    public PriceRule getById(String id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("PriceRule not found: " + id));
    }

    @Override
    public List<PriceRule> getAll() { return repo.findAll(); }

    @Override
    public PriceRule update(String id, PriceRule p) {
        PriceRule existing = getById(id);
        existing.setProductId(p.getProductId());
        existing.setUnitPrice(p.getUnitPrice());
        existing.setCurrencyCode(p.getCurrencyCode());
        existing.setIsActive(p.getIsActive());
        return repo.save(existing);
    }

    @Override
    public void delete(String id) { repo.deleteById(id); }

    @Override
    public List<PriceRule> getByProductIds(List<String> productIds) {
        return repo.findByProductIdInAndIsActiveTrue(productIds);
    }
}