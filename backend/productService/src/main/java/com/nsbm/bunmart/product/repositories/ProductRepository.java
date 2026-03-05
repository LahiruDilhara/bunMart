package com.nsbm.bunmart.product.repositories;

import com.nsbm.bunmart.product.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {

    Optional<Product> findByIdAndAvailabilityTrue(String id);

    List<Product> findByAvailabilityTrue();

    List<Product> findByAvailabilityTrue(org.springframework.data.domain.Sort sort);

    List<Product> findAll(org.springframework.data.domain.Sort sort);

    List<Product> findByCategoryId(Integer categoryId);

    List<Product> findByCategoryIdAndAvailabilityTrue(Integer categoryId);

    List<Product> findByCategoryIdAndAvailabilityTrue(Integer categoryId, org.springframework.data.domain.Sort sort);

    boolean existsByIdAndAvailabilityTrue(String id);

    boolean existsByCategoryId(Integer categoryId);

    boolean existsByCategory_IdAndName(Integer categoryId, String name);
}
