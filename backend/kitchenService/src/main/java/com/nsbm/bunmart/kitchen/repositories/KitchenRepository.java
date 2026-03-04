package com.nsbm.bunmart.kitchen.repositories;

import com.nsbm.bunmart.kitchen.model.KitchenOrder;
import com.nsbm.bunmart.kitchen.model.KitchenStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface KitchenRepository extends JpaRepository<KitchenOrder, String> {
    List<KitchenOrder> findByStatusNot(KitchenStatus status);
}