//package com.nsbm.bunmart.shipping.controller;
//
//import com.nsbm.bunmart.shipping.dto.ShippingIntentDTO;
//import com.nsbm.bunmart.shipping.model.ShippingIntentStatus;
//import com.nsbm.bunmart.shipping.services.ShippingIntentService;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/v1/shipping/shipping-intents")
//public class ShippingIntentController {
//
//    private final ShippingIntentService shippingIntentService;
//
//    public ShippingIntentController(ShippingIntentService shippingIntentService) {
//        this.shippingIntentService = shippingIntentService;
//    }
//
//    // Create Shipping Intent
//    @PostMapping("/create-intent")
//    public ResponseEntity<ShippingIntentDTO> createShippingIntent(@RequestBody ShippingIntentDTO dto){
//        ShippingIntentDTO shippingIntentCreate = shippingIntentService.createShippingIntent(dto);
//        return ResponseEntity.ok(shippingIntentCreate);
//    }
//
//    // Get Shipping Intent by ID
//    @GetMapping("/{intentId}")
//    public ResponseEntity<ShippingIntentDTO> getShippingIntentById(@PathVariable Integer intentId){
//        ShippingIntentDTO shippingIntentDTO =  shippingIntentService.getShippingIntentById(intentId);
//        return ResponseEntity.ok(shippingIntentDTO);
//    }
//
//    // Get all shipping intents
//    @GetMapping("all-shippingIntents")
//    public ResponseEntity<List<ShippingIntentDTO>> getAllShippingIntents() {
//        List<ShippingIntentDTO> list = shippingIntentService.getAllShippingIntents();
//        return ResponseEntity.ok(list);
//    }
//
//    // Get Shipping Intents by Status
//    @GetMapping("/status/{status}")
//    public ResponseEntity<List<ShippingIntentDTO>> getShippingIntentsByStatus(@PathVariable String status){
//
//        // Convert string to enum
//        ShippingIntentStatus shippingIntentStatus;
//
//        try {
//            shippingIntentStatus = ShippingIntentStatus.valueOf(status.toUpperCase());
//        }
//
//        catch (IllegalArgumentException e){
//            return ResponseEntity.badRequest().build();
//        }
//
//        List<ShippingIntentDTO> list = shippingIntentService.getShippingIntentsByStatus(shippingIntentStatus);
//        return ResponseEntity.ok(list);
//
//    }
//
//    //  Update Shipping Intent Status
//    @PatchMapping("/{intentId}")
//    public ResponseEntity<ShippingIntentDTO> updateShippingIntentStatus(
//            @PathVariable Integer intentId,
//            @RequestBody ShippingIntentDTO shippingIntentDTO) {
//
//        ShippingIntentStatus shippingIntentStatus;
//
//        try {
//            // Convert the status string to enum
//            shippingIntentStatus = ShippingIntentStatus.valueOf(String.valueOf(shippingIntentDTO.getStatus()));
//        } catch (IllegalArgumentException e) {
//            // Invalid status value
//            return ResponseEntity.badRequest().build();
//        }
//
//        // Call service to update
//        ShippingIntentDTO statusUpdated =
//                shippingIntentService.updateShippingIntentStatus(intentId, shippingIntentStatus);
//
//        return ResponseEntity.ok(statusUpdated);
//    }
//
//}








package com.nsbm.bunmart.shipping.controller;

import com.nsbm.bunmart.shipping.dto.ShippingIntentDTO;
import com.nsbm.bunmart.shipping.model.ShippingIntentStatus;
import com.nsbm.bunmart.shipping.services.ShippingIntentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/shipping/shipping-intents")
public class ShippingIntentController {

    private final ShippingIntentService service;

    public ShippingIntentController(ShippingIntentService service) {
        this.service = service;
    }

    // -------------------------
    // Create Shipping Intent (from order)
    // -------------------------
    @PostMapping("/create-from-order/{orderId}")
    public ResponseEntity<ShippingIntentDTO> createFromOrder(@PathVariable String orderId) {
        ShippingIntentDTO dto = service.createShippingIntentFromOrder(orderId);
        return ResponseEntity.ok(dto);
    }

    // -------------------------
    // Get Shipping Intent by ID
    // -------------------------
    @GetMapping("/{intentId}")
    public ResponseEntity<ShippingIntentDTO> getById(@PathVariable Integer intentId) {
        return ResponseEntity.ok(service.getShippingIntentById(intentId));
    }

    // -------------------------
    // Get all Shipping Intents
    // -------------------------
    @GetMapping("/all")
    public ResponseEntity<List<ShippingIntentDTO>> getAll() {
        return ResponseEntity.ok(service.getAllShippingIntents());
    }

    // -------------------------
    // Update Status
    // -------------------------
    @PatchMapping("/{intentId}/status")
    public ResponseEntity<ShippingIntentDTO> updateStatus(
            @PathVariable Integer intentId,
            @RequestBody ShippingIntentDTO dto) {
        ShippingIntentStatus status = ShippingIntentStatus.valueOf(dto.getStatus().name());
        return ResponseEntity.ok(service.updateShippingIntentStatus(intentId, status));
    }
}