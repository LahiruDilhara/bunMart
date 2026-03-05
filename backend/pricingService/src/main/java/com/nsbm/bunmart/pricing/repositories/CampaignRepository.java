package com.nsbm.bunmart.pricing.repositories;

import com.nsbm.bunmart.pricing.model.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    List<Campaign> findByIsActiveTrueAndStartDateBeforeAndEndDateAfter(
            LocalDateTime now, LocalDateTime now2);

    @Query("SELECT DISTINCT c FROM Campaign c JOIN c.discountRules d WHERE d.productId = :productId AND c.isActive = true AND c.startDate <= :now AND c.endDate >= :now")
    List<Campaign> findActiveCampaignsByProductId(@Param("productId") String productId, @Param("now") LocalDateTime now);
}