package com.nsbm.bunmart.kitchen.repositories;

import com.nsbm.bunmart.kitchen.model.KitchenOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KitchenOrderRepository extends JpaRepository<KitchenOrder, String> {
    List<KitchenOrder> findByOrderId(String orderId);
    List<KitchenOrder> findByUserId(String userId);
}
