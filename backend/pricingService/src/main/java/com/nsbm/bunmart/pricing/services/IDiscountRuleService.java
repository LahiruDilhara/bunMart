package com.nsbm.bunmart.pricing.interface_;

import com.nsbm.bunmart.pricing.model.DiscountRule;
import java.util.List;

public interface IDiscountRuleService {
    DiscountRule create(DiscountRule discountRule);
    DiscountRule getById(String id);
    List<DiscountRule> getAll();
    DiscountRule update(String id, DiscountRule discountRule);
    void delete(String id);
    List<DiscountRule> getByProductIds(List<String> productIds);
}