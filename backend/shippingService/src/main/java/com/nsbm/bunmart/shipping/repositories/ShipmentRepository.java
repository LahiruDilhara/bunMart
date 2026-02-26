package com.nsbm.bunmart.shipping.repositories;

import com.nsbm.bunmart.shipping.model.Shipment;
import com.nsbm.bunmart.shipping.model.ShippingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Integer> {

    List<Shipment> findByStatus(ShippingStatus status);

    // Custom method to find shipment by tracking number
    Optional<Shipment> findByTrackingNumber(Integer trackingNumber);

}
