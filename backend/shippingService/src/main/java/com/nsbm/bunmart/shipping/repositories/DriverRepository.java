package com.nsbm.bunmart.shipping.repositories;

import com.nsbm.bunmart.shipping.model.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Integer> {
}
