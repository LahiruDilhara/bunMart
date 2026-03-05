package com.nsbm.bunmart.order.repositories;

import com.nsbm.bunmart.order.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {

    List<Order> findByUserId(String userId);

    Page<Order> findByStatus(String status, Pageable pageable);

    boolean existsById(String id);
}
