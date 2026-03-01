package com.nsbm.bunmart.pricing.interface_;

import com.nsbm.bunmart.pricing.model.Campaign;
import java.util.List;

public interface ICampaignService {
    Campaign create(Campaign campaign);
    Campaign getById(String id);
    List<Campaign> getAll();
    Campaign update(String id, Campaign campaign);
    void delete(String id);
}