package com.nsbm.bunmart.pricing.services;

import com.nsbm.bunmart.pricing.model.Campaign;
import com.nsbm.bunmart.pricing.interfaces.ICampaignService;
import com.nsbm.bunmart.pricing.repositories.CampaignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CampaignService implements ICampaignService {

    private final CampaignRepository repository;

    @Override
    public Campaign create(Campaign campaign) {
        return repository.save(campaign);
    }

    @Override
    public Campaign getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found with id: " + id));
    }

    @Override
    public List<Campaign> getAll() {
        return repository.findAll();
    }

    @Override
    public Campaign update(Long id, Campaign campaign) {
        Campaign existing = getById(id);
        existing.setName(campaign.getName());
        existing.setDescription(campaign.getDescription());
        existing.setStartDate(campaign.getStartDate());
        existing.setEndDate(campaign.getEndDate());
        existing.setIsActive(campaign.getIsActive());
        return repository.save(existing);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }
}