package com.nsbm.bunmart.kitchen.repositories;

import com.nsbm.bunmart.kitchen.model.PreparationImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PreparationImageRepository extends JpaRepository<PreparationImage, String> {
}
