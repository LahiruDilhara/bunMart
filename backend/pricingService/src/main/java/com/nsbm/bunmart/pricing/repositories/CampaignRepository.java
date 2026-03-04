package com.nsbm.bunmart.pricing.repositories;

import com.nsbm.bunmart.pricing.model.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CampaignRepository extends JpaRepository<Campaign, Long> {
}