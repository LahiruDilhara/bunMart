package com.nsbm.bunmart.kitchen.controller;

import com.nsbm.bunmart.kitchen.dto.*;
import com.nsbm.bunmart.kitchen.mappers.rest.KitchenMapper;
import com.nsbm.bunmart.kitchen.model.KitchenOrder;
import com.nsbm.bunmart.kitchen.services.KitchenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/kitchen-orders")
@RequiredArgsConstructor
public class KitchenOrderController {

    private final KitchenService kitchenService;
    private final KitchenMapper kitchenMapper;

    @PostMapping
    public ResponseEntity<KitchenOrderResponseDTO> createKitchenOrder(@Valid @RequestBody CreateKitchenOrderRequestDTO request) {
        KitchenOrder order = kitchenService.createKitchenOrder(
                request.getUserId(),
                request.getOrderId(),
                request.getLines()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(kitchenMapper.toResponseDTO(order));
    }

    @GetMapping
    public ResponseEntity<List<KitchenOrderResponseDTO>> getAll() {
        List<KitchenOrderResponseDTO> list = kitchenService.getAllKitchenOrders().stream()
                .map(kitchenMapper::toResponseDTO)
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<KitchenOrderResponseDTO>> getByOrderId(@PathVariable String orderId) {
        List<KitchenOrderResponseDTO> list = kitchenService.getKitchenOrdersByOrderId(orderId).stream()
                .map(kitchenMapper::toResponseDTO)
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<KitchenOrderResponseDTO> getById(@PathVariable String id) {
        KitchenOrder order = kitchenService.getKitchenOrder(id);
        return ResponseEntity.ok(kitchenMapper.toResponseDTO(order));
    }

    @PutMapping("/{id}")
    public ResponseEntity<KitchenOrderResponseDTO> updateKitchenOrder(
            @PathVariable String id,
            @Valid @RequestBody UpdateKitchenOrderRequestDTO request) {
        KitchenOrder order = kitchenService.updateKitchenOrder(id, request.getUserId(), request.getOrderId());
        return ResponseEntity.ok(kitchenMapper.toResponseDTO(order));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<KitchenOrderResponseDTO> updateKitchenOrderStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateKitchenOrderStatusRequestDTO request) {
        KitchenOrder order = kitchenService.updateKitchenOrderStatus(id, request.getStatus());
        return ResponseEntity.ok(kitchenMapper.toResponseDTO(order));
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<KitchenOrderResponseDTO> stopKitchenOrder(@PathVariable String id) {
        KitchenOrder order = kitchenService.stopKitchenOrder(id);
        return ResponseEntity.ok(kitchenMapper.toResponseDTO(order));
    }

    @PutMapping("/{id}/lines/{lineId}/progress")
    public ResponseEntity<KitchenOrderResponseDTO> updateLineProgress(
            @PathVariable String id,
            @PathVariable String lineId,
            @Valid @RequestBody UpdateLineProgressRequestDTO request) {
        KitchenOrder order = kitchenService.updateLineProgress(id, lineId, request.getProgress());
        return ResponseEntity.ok(kitchenMapper.toResponseDTO(order));
    }

    @PutMapping("/{id}/lines/{lineId}/status")
    public ResponseEntity<KitchenOrderResponseDTO> updateLineStatus(
            @PathVariable String id,
            @PathVariable String lineId,
            @Valid @RequestBody UpdateLineStatusRequestDTO request) {
        KitchenOrder order = kitchenService.updateLineStatus(id, lineId, request.getStatus());
        return ResponseEntity.ok(kitchenMapper.toResponseDTO(order));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteKitchenOrder(@PathVariable String id) {
        kitchenService.deleteKitchenOrder(id);
        return ResponseEntity.ok().build();
    }
}
