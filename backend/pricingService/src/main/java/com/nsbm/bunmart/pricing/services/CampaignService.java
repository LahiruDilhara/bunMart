package com.nsbm.bunmart.pricing.services;

import com.nsbm.bunmart.pricing.model.Campaign;
import com.nsbm.bunmart.pricing.repositories.CampaignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CampaignService implements ICampaignService {

    private final CampaignRepository repo;

    @Override
    public Campaign create(Campaign c) { return repo.save(c); }

    @Override
    public Campaign getById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Campaign not found: " + id));
    }

    @Override
    public List<Campaign> getAll() { return repo.findAll(); }

    @Override
    public Campaign update(Long id, Campaign c) {
        Campaign existing = getById(id);
        existing.setName(c.getName());
        existing.setDescription(c.getDescription());
        existing.setStartDate(c.getStartDate());
        existing.setEndDate(c.getEndDate());
        existing.setIsActive(c.getIsActive());
        return repo.save(existing);
    }

    @Override
    public void delete(Long id) { repo.deleteById(id); }
}