package com.nsbm.bunmart.kitchen.controller;

import com.nsbm.bunmart.kitchen.dto.KitchenOrderResponseDTO;
import com.nsbm.bunmart.kitchen.dto.UpdateStatusRequestDTO;
import com.nsbm.bunmart.kitchen.services.KitchenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/kitchen")
@RequiredArgsConstructor
public class KitchenController {
    private final KitchenService kitchenService;

    @PostMapping("/receive/{orderId}")
    public ResponseEntity<KitchenOrderResponseDTO> receiveOrder(@PathVariable String orderId) {
        return ResponseEntity.ok(kitchenService.fetchAndInitializeOrder(orderId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<KitchenOrderResponseDTO>> getActive() {
        return ResponseEntity.ok(kitchenService.getActiveOrders());
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<KitchenOrderResponseDTO> updateStatus(
            @PathVariable String orderId, @RequestBody UpdateStatusRequestDTO dto) {
        return ResponseEntity.ok(kitchenService.updateStatus(orderId, dto.getStatus()));
    }
}