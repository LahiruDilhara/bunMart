package com.nsbm.bunmart.pricing.services;

import com.nsbm.bunmart.pricing.errors.DiscountNotFoundException;
import com.nsbm.bunmart.pricing.model.Discount;
import com.nsbm.bunmart.pricing.repositories.DiscountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class DiscountService {

    private final DiscountRepository discountRepository;

    public Discount create(String productId, Integer minQuantity, String type, BigDecimal value, String description) {
        Discount d = new Discount();
        d.setProductId(productId);
        d.setMinQuantity(minQuantity);
        d.setType(type);
        d.setValue(value);
        d.setDescription(description);
        return discountRepository.save(d);
    }

    public Discount getById(Long id) {
        return discountRepository.findById(id)
                .orElseThrow(() -> new DiscountNotFoundException("Discount not found: " + id));
    }

    public List<Discount> getAll() {
        return discountRepository.findAll();
    }

    public List<Discount> getByProductId(String productId) {
        return discountRepository.findByProductIdAndIsActiveTrueOrderByMinQuantityDesc(productId);
    }

    public List<Discount> getByProductIds(List<String> productIds) {
        return discountRepository.findByProductIdInAndIsActiveTrue(productIds);
    }

    public Discount update(Long id, String productId, Integer minQuantity, String type, BigDecimal value,
                           String description, Boolean isActive) {
        Discount d = getById(id);
        if (productId != null) d.setProductId(productId);
        if (minQuantity != null) d.setMinQuantity(minQuantity);
        if (type != null) d.setType(type);
        if (value != null) d.setValue(value);
        if (description != null) d.setDescription(description);
        if (isActive != null) d.setIsActive(isActive);
        return discountRepository.save(d);
    }

    public void delete(Long id) {
        Discount d = getById(id);
        discountRepository.delete(d);
    }
}
