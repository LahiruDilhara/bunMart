package com.nsbm.bunmart.kitchen.repositories;

import com.nsbm.bunmart.kitchen.model.ProductionOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductionOrderRepository extends JpaRepository<ProductionOrder, String> {
    List<ProductionOrder> findByUserOrderId(String userOrderId);
}
