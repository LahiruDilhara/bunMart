package com.nsbm.bunmart.order.repositories;

import com.nsbm.bunmart.order.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {

    List<Order> findByUserId(String userId);

    boolean existsById(String id);
}
