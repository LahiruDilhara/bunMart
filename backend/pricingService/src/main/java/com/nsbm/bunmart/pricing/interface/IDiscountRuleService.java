package com.nsbm.bunmart.pricing.interfaces;

import com.nsbm.bunmart.pricing.model.DiscountRule;
import java.util.List;

public interface IDiscountRuleService {
    DiscountRule create(DiscountRule discountRule);
    DiscountRule getById(Long id);
    List<DiscountRule> getAll();
    DiscountRule update(Long id, DiscountRule discountRule);
    void delete(Long id);
    List<DiscountRule> getByProductIds(List<String> productIds);
}