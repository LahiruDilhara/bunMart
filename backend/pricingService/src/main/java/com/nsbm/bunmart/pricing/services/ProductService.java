package com.nsbm.bunmart.pricing.services;

import com.nsbm.bunmart.pricing.errors.ProductNotFoundException;
import com.nsbm.bunmart.pricing.errors.DuplicateProductIdException;
import com.nsbm.bunmart.pricing.model.Product;
import com.nsbm.bunmart.pricing.repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Product create(String id, String name, BigDecimal rawPrice, BigDecimal tax, BigDecimal shippingCost, String currencyCode) {
        if (productRepository.existsById(id)) {
            throw new DuplicateProductIdException("Product already exists for id: " + id);
        }
        Product p = new Product();
        p.setId(id);
        p.setName(name);
        p.setRawPrice(rawPrice);
        p.setTax(tax);
        p.setShippingCost(shippingCost != null ? shippingCost : BigDecimal.ZERO);
        p.setCurrencyCode(currencyCode);
        return productRepository.save(p);
    }

    public Product getById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found: " + id));
    }

    public List<Product> getAll() {
        return productRepository.findAll();
    }

    public List<Product> getByIds(List<String> productIds) {
        return productRepository.findByIdInAndIsActiveTrue(productIds);
    }

    public Product update(String id, String name, BigDecimal rawPrice, BigDecimal tax, BigDecimal shippingCost,
                          String currencyCode, Boolean isActive) {
        Product p = getById(id);
        if (name != null) p.setName(name);
        if (rawPrice != null) p.setRawPrice(rawPrice);
        if (tax != null) p.setTax(tax);
        if (shippingCost != null) p.setShippingCost(shippingCost);
        if (currencyCode != null) p.setCurrencyCode(currencyCode);
        if (isActive != null) p.setIsActive(isActive);
        return productRepository.save(p);
    }

    public void delete(String id) {
        Product p = getById(id);
        productRepository.delete(p);
    }
}
