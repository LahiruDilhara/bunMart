package com.nsbm.bunmart.shipping.services;

import com.nsbm.bunmart.shipping.dto.ShipmentDTO;
import com.nsbm.bunmart.shipping.model.*;
import com.nsbm.bunmart.shipping.repositories.DriverRepository;
import com.nsbm.bunmart.shipping.repositories.ShipmentRepository;
import com.nsbm.bunmart.shipping.repositories.ShippingIntentRepository;
import com.nsbm.bunmart.shipping.repositories.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ShipmentService {

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ShippingIntentRepository shippingIntentRepository;
    public Shipment createShipment(ShipmentDTO dto) {

        // etch related entities safely
        Driver driver = driverRepository.findById(Long.valueOf(dto.getDriverId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found"));

        Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));

        ShippingIntent shippingIntent = shippingIntentRepository.findById(dto.getShippingIntentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shipping Intent not found"));

        // Convert DTO → Entity
        Shipment shipment = Shipment.builder()
                .driverId(driver)                       // Entity reference
                .vehicleId(vehicle)                     // Entity reference
                .shippingIntentId(shippingIntent)      // Entity reference
                .trackingNumber(dto.getTrackingNumber())
                .status(ShippingStatus.valueOf(dto.getStatus().toUpperCase())) // Safe enum conversion
                .startedAt(dto.getStartedAt())
                .deliveredAt(dto.getDeliveredAt())
                .build();

        // Save and return
        return shipmentRepository.save(shipment);
    }

    public ShipmentDTO getShipmentById(Integer shipmentId) {
        // Fetch the shipment
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found with ID: " + shipmentId));

        // Map to DTO (only IDs for related entities)
        ShipmentDTO shipmentDTO = ShipmentDTO.builder()
                .shipmentId(shipment.getShipmentId())
                .shippingIntentId(shipment.getShippingIntentId().getShipping_intent_id())
                .driverId(shipment.getDriverId().getDriver_id())
                .vehicleId(shipment.getVehicleId().getVehicle_id())
                .trackingNumber(shipment.getTrackingNumber())
                .status(shipment.getStatus().name())
                .startedAt(shipment.getStartedAt())
                .deliveredAt(shipment.getDeliveredAt())
                .build();

        // Return the DTO
        return shipmentDTO;
    }

    public ShipmentDTO getShipmentByTrackingNumber(Integer trackingNumber) {
        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new RuntimeException("Shipment not found with Tracking Number: " + trackingNumber));

        // Map to DTO (only IDs for related entities)
        ShipmentDTO shipmentDTO = ShipmentDTO.builder()
                .shipmentId(shipment.getShipmentId())
                .shippingIntentId(shipment.getShippingIntentId().getShipping_intent_id())
                .driverId(shipment.getDriverId().getDriver_id())
                .vehicleId(shipment.getVehicleId().getVehicle_id())
                .trackingNumber(shipment.getTrackingNumber())
                .status(shipment.getStatus().name())
                .startedAt(shipment.getStartedAt())
                .deliveredAt(shipment.getDeliveredAt())
                .build();

        // Return the DTO
        return shipmentDTO;
    }

}
