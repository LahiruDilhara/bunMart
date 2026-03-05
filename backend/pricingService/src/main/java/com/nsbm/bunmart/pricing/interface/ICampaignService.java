package com.nsbm.bunmart.pricing.interfaces;

import com.nsbm.bunmart.pricing.model.Campaign;
import java.util.List;

public interface ICampaignService {
    Campaign create(Campaign campaign);
    Campaign getById(Long id);
    List<Campaign> getAll();
    Campaign update(Long id, Campaign campaign);
    void delete(Long id);
}