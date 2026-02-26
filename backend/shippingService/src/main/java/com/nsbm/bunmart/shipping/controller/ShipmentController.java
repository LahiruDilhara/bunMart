package com.nsbm.bunmart.shipping.controller;


import com.nsbm.bunmart.shipping.dto.ShipmentDTO;
import com.nsbm.bunmart.shipping.model.Shipment;
import com.nsbm.bunmart.shipping.services.ShipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {

    @Autowired
    private ShipmentService shipmentService;

    @PostMapping("create-shipment")
    public ResponseEntity<Shipment> createShipment(@RequestBody ShipmentDTO shipmentDTO) {
        Shipment shipment = shipmentService.createShipment(shipmentDTO);
        return ResponseEntity.ok(shipment);
    }

    // Get Shipment by ID
    @GetMapping("/{id}")
    public ResponseEntity<ShipmentDTO> getShipmentById(@PathVariable("id") Integer shipmentId) {
        ShipmentDTO shipmentDTO = shipmentService.getShipmentById(shipmentId);
        return ResponseEntity.ok(shipmentDTO);
    }

    @GetMapping("/tracking/{trackingNumber}")
    public ResponseEntity<ShipmentDTO> getShipmentByTrackingNumber(@PathVariable("trackingNumber") Integer trackingNumber) {
        ShipmentDTO shipmentDTO = shipmentService.getShipmentByTrackingNumber(trackingNumber);
        return ResponseEntity.ok(shipmentDTO);
    }
}
