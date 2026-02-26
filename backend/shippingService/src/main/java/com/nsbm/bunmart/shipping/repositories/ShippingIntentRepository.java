package com.nsbm.bunmart.shipping.repositories;

import com.nsbm.bunmart.shipping.model.ShippingIntent;
import com.nsbm.bunmart.shipping.model.ShippingIntentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShippingIntentRepository extends JpaRepository<ShippingIntent, Integer> {

    List<ShippingIntent> findByStatus(ShippingIntentStatus status);

}
