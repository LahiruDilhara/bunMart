package com.nsbm.bunmart.pricing.interfaces;

import com.nsbm.bunmart.pricing.model.PriceRule;
import java.util.List;

public interface IPriceRuleService {
    PriceRule create(PriceRule priceRule);
    PriceRule getById(Long id);
    List<PriceRule> getAll();
    PriceRule update(Long id, PriceRule priceRule);
    void delete(Long id);
    List<PriceRule> getByProductIds(List<String> productIds);
}