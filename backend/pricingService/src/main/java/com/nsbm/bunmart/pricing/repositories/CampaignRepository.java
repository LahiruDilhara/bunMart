package com.nsbm.bunmart.pricing.repositories;

import com.nsbm.bunmart.pricing.model.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface CampaignRepository extends JpaRepository<Campaign, Long> {
    List<Campaign> findByIsActiveTrueAndStartDateBeforeAndEndDateAfter(
            LocalDateTime now, LocalDateTime now2);

    @Query("SELECT c FROM Campaign c JOIN c.discountRules d WHERE d.productId = :productId AND c.isActive = true AND c.startDate <= :now AND c.endDate >= :now")
    List<Campaign> findActiveCampaignsByProductId(@Param("productId") String productId, @Param("now") LocalDateTime now);
}