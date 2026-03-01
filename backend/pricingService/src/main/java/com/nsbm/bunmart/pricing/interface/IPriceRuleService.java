package com.nsbm.bunmart.pricing;

import com.nsbm.bunmart.pricing.model.PriceRule;

import java.util.List;

public interface IPriceRuleService {
    PriceRule create(PriceRule priceRule);
    PriceRule getById(String id);
    List<PriceRule> getAll();
    PriceRule update(String id, PriceRule priceRule);
    void delete(String id);
    List<PriceRule> getByProductIds(List<String> productIds);
}