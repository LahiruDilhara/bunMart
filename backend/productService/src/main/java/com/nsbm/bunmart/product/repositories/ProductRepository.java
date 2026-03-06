package com.nsbm.bunmart.product.repository;

import com.nsbm.bunmart.product.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {

    List<Product> findByActiveTrue();

    List<Product> findByCategoryIdAndActiveTrue(String categoryId);

    // Fetch all products whose IDs are in the given list (used by GetProducts RPC)
    @Query("SELECT p FROM Product p WHERE p.productId IN :ids AND p.active = true")
    List<Product> findAllByProductIdIn(@Param("ids") List<String> productIds);

    // Used by ValidateProducts RPC — returns only the IDs that actually exist
    @Query("SELECT p.productId FROM Product p WHERE p.productId IN :ids AND p.active = true")
    List<String> findValidProductIds(@Param("ids") List<String> productIds);

    boolean existsByProductIdAndActiveTrue(String productId);
}
