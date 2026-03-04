package com.nsbm.bunmart.kitchen.controller;

import com.nsbm.bunmart.kitchen.dto.*;
import com.nsbm.bunmart.kitchen.mappers.rest.RestMapper;
import com.nsbm.bunmart.kitchen.model.ProductionOrder;
import com.nsbm.bunmart.kitchen.services.KitchenService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/production-orders")
public class ProductionOrderController {

    private final KitchenService kitchenService;
    private final RestMapper restMapper;

    public ProductionOrderController(KitchenService kitchenService, RestMapper restMapper) {
        this.kitchenService = kitchenService;
        this.restMapper = restMapper;
    }

    // GET /api/v1/production-orders
    @GetMapping
    public ResponseEntity<List<ProductionOrderResponseDTO>> getAll() {
        List<ProductionOrderResponseDTO> orders = kitchenService.getAllProductionOrders()
                .stream()
                .map(restMapper::toResponseDTO)
                .toList();
        return ResponseEntity.ok(orders);
    }

    // GET /api/v1/production-orders/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ProductionOrderResponseDTO> getById(@PathVariable String id) {
        ProductionOrder order = kitchenService.getProductionOrder(id);
        return ResponseEntity.ok(restMapper.toResponseDTO(order));
    }

    // PUT /api/v1/production-orders/{id}/phase
    @PutMapping("/{id}/phase")
    public ResponseEntity<ProductionOrderResponseDTO> updatePhase(
            @PathVariable String id,
            @Valid @RequestBody UpdatePhaseRequestDTO request) {
        ProductionOrder order = kitchenService.updatePhase(id, request.getPhase(), request.getProgressPercent());
        return ResponseEntity.ok(restMapper.toResponseDTO(order));
    }

    // PUT /api/v1/production-orders/{id}/notes
    @PutMapping("/{id}/notes")
    public ResponseEntity<ProductionOrderResponseDTO> updateNotes(
            @PathVariable String id,
            @Valid @RequestBody UpdateNotesRequestDTO request) {
        ProductionOrder order = kitchenService.updateNotes(id, request.getNotes());
        return ResponseEntity.ok(restMapper.toResponseDTO(order));
    }

    // POST /api/v1/production-orders/{id}/images
    @PostMapping("/{id}/images")
    public ResponseEntity<ProductionOrderResponseDTO> addImage(
            @PathVariable String id,
            @Valid @RequestBody AddImageRequestDTO request) {
        ProductionOrder order = kitchenService.addImage(id, request.getImageUrl());
        return ResponseEntity.status(HttpStatus.CREATED).body(restMapper.toResponseDTO(order));
    }

    // DELETE /api/v1/production-orders/{id}/images/{imageId}
    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable String id, @PathVariable String imageId) {
        kitchenService.deleteImage(id, imageId);
        return ResponseEntity.ok().build();
    }

    // DELETE /api/v1/production-orders/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        kitchenService.deleteProductionOrder(id);
        return ResponseEntity.ok().build();
    }
}
