package com.nsbm.bunmart.shipping.repositories;

import com.nsbm.bunmart.shipping.model.ShippingPackage;
import com.nsbm.bunmart.shipping.model.ShippingPackageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShippingPackageRepository extends JpaRepository<ShippingPackage, String> {
    List<ShippingPackage> findByOrderId(String orderId);
    List<ShippingPackage> findByStatus(ShippingPackageStatus status);
}
