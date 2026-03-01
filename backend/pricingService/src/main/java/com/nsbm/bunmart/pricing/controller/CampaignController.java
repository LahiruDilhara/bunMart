package com.nsbm.bunmart.pricing.controller;

import com.nsbm.bunmart.pricing.interface_.ICampaignService;
import com.nsbm.bunmart.pricing.model.Campaign;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final ICampaignService service;

    @PostMapping
    public ResponseEntity<Campaign> create(@RequestBody Campaign campaign) {
        return ResponseEntity.ok(service.create(campaign));
    }

    @GetMapping
    public ResponseEntity<List<Campaign>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Campaign> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Campaign> update(@PathVariable Long id, @RequestBody Campaign campaign) {
        return ResponseEntity.ok(service.update(id, campaign));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}