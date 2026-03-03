package com.nsbm.bunmart.order.repositories;

import com.nsbm.bunmart.order.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    List<Order> findByUserId(String userId);

    boolean existsById(Integer id);
}
