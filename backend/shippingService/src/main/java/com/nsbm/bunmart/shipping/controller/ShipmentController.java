package com.nsbm.bunmart.shipping.controller;


import com.nsbm.bunmart.shipping.dto.ShipmentDTO;
import com.nsbm.bunmart.shipping.model.Shipment;
import com.nsbm.bunmart.shipping.model.ShippingStatus;
import com.nsbm.bunmart.shipping.services.ShipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/shipments")
public class ShipmentController {

    @Autowired
    private ShipmentService shipmentService;

    @PostMapping("create-shipment")
    public ResponseEntity<Shipment> createShipment(@RequestBody ShipmentDTO shipmentDTO) {
        Shipment shipment = shipmentService.createShipment(shipmentDTO);
        return ResponseEntity.ok(shipment);
    }

    // Get Shipment by ID
    @GetMapping("/{shipmentId}")
    public ResponseEntity<ShipmentDTO> getShipmentById(@PathVariable Integer shipmentId) {
        ShipmentDTO shipmentDTO = shipmentService.getShipmentById(shipmentId);
        return ResponseEntity.ok(shipmentDTO);
    }

    @GetMapping("/tracking/{trackingNumber}")
    public ResponseEntity<ShipmentDTO> getShipmentByTrackingNumber(@PathVariable Integer trackingNumber) {
        ShipmentDTO shipmentDTO = shipmentService.getShipmentByTrackingNumber(trackingNumber);
        return ResponseEntity.ok(shipmentDTO);
    }

    @GetMapping("all-shipments")
    public ResponseEntity<List<ShipmentDTO>> getAllShipments() {
        List<ShipmentDTO> shipments = shipmentService.getAllShipments();
        return ResponseEntity.ok(shipments);
    }

    @PatchMapping("/{shipmentId}")
    public ResponseEntity<ShipmentDTO> updateShipmentStatus( @PathVariable Integer shipmentId, @RequestBody ShipmentDTO shipmentDTO) {

        ShippingStatus shippingStatus;

        try{
            shippingStatus = ShippingStatus.valueOf(shipmentDTO.getStatus().toUpperCase());
        }

        catch (IllegalArgumentException e) {
            // Invalid status value
            return ResponseEntity.badRequest().build();
        }

        ShipmentDTO updatedShipment = shipmentService.updateShipmentStatus(shipmentId, shippingStatus);
        return ResponseEntity.ok(updatedShipment);
    }

    @PatchMapping("/{shipmentId}/assign")
    public ResponseEntity<ShipmentDTO> assignDriverAndVehicle(
            @PathVariable Integer shipmentId,
            @RequestBody ShipmentDTO request) {

        ShipmentDTO updatedShipment =
                shipmentService.assignDriverAndVehicle(
                        shipmentId,
                        request.getDriverId(),
                        request.getVehicleId());

        return ResponseEntity.ok(updatedShipment);
    }


    @DeleteMapping("/{shipmentId}")
    public ResponseEntity<String> deleteShipment(@PathVariable Integer shipmentId) {

        String response = shipmentService.deleteShipment(shipmentId);

        return ResponseEntity.ok(response);
    }
}
