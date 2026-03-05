package com.nsbm.bunmart.pricing.repositories;

import com.nsbm.bunmart.pricing.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findByIdInAndIsActiveTrue(List<String> productIds);
}
