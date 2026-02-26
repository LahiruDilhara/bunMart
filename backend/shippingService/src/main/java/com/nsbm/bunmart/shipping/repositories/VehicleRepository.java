package com.nsbm.bunmart.shipping.repositories;

import com.nsbm.bunmart.shipping.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {
}
