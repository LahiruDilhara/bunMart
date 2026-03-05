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

import java.time.LocalDateTime;
import java.util.List;

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

        // Convert DTO -> Entity
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

        // Map to DTO
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

//    public ShipmentDTO getShipmentByTrackingNumber(Integer trackingNumber) {
//
//        // Fetch from DB
//        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
//                .orElseThrow(() -> new RuntimeException("Shipment not found with Tracking Number: " + trackingNumber));

    public ShipmentDTO getShipmentByTrackingNumber(Integer trackingNumber) {
        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Shipment not found with Tracking Number: " + trackingNumber
                ));

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

    public List<ShipmentDTO> getAllShipments() {

        List<ShipmentDTO> shipments = shipmentRepository.findAll()
                .stream()
                .map(shipment -> ShipmentDTO.builder()
                        .shipmentId(shipment.getShipmentId())
                        .shippingIntentId(shipment.getShippingIntentId().getShipping_intent_id())
                        .driverId(shipment.getDriverId().getDriver_id())
                        .vehicleId(shipment.getVehicleId().getVehicle_id())
                        .trackingNumber(shipment.getTrackingNumber())
                        .status(shipment.getStatus().name())
                        .startedAt(shipment.getStartedAt())
                        .deliveredAt(shipment.getDeliveredAt())
                        .build()
                )
                .toList();

        return  shipments;
    }

    public ShipmentDTO updateShipmentStatus(Integer shipmentId, ShippingStatus status) {

        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() ->
                        new RuntimeException("Shipment not found with ID: " + shipmentId));

        // Set new status
        shipment.setStatus(status);

        // Auto-set delivered time
        if (status == ShippingStatus.DELIVERED) {
            shipment.setDeliveredAt(LocalDateTime.now());
        }
        // Save updated shipment
        Shipment updatedShipment = shipmentRepository.save(shipment);

        // Convert Entity → DTO
        ShipmentDTO shipmentDTO =  ShipmentDTO.builder()
                .shipmentId(updatedShipment.getShipmentId())
                .shippingIntentId(updatedShipment.getShippingIntentId().getShipping_intent_id())
                .driverId(updatedShipment.getDriverId().getDriver_id())
                .vehicleId(updatedShipment.getVehicleId().getVehicle_id())
                .trackingNumber(updatedShipment.getTrackingNumber())
                .status(updatedShipment.getStatus().name())
                .startedAt(updatedShipment.getStartedAt())
                .deliveredAt(updatedShipment.getDeliveredAt())
                .build();

        return shipmentDTO;
    }

    public ShipmentDTO assignDriverAndVehicle(
            Integer shipmentId,
            Integer driverId,
            Integer vehicleId) {

        // Find Shipment
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found with ID: " + shipmentId));

        // Find Driver
        Driver driver = driverRepository.findById(Long.valueOf(driverId))
                .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + driverId));

        // Validate Driver Active
        if (!driver.isActive()) {
            throw new RuntimeException("Driver is not active");
        }

        // Find Vehicle
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with ID: " + vehicleId));

        // alidate Vehicle Active
        if (!vehicle.isActive()) {
            throw new RuntimeException("Vehicle is not active");
        }

        // Assign Driver & Vehicle
        shipment.setDriverId(driver);
        shipment.setVehicleId(vehicle);

        // Update Status → DISPATCHED
        shipment.setStatus(ShippingStatus.DISPATCHED);

        // Optional: set started time
        shipment.setStartedAt(java.time.LocalDateTime.now());

        // Save
        Shipment updatedShipment = shipmentRepository.save(shipment);

        // Convert to DTO
        ShipmentDTO shipmentDTO =  ShipmentDTO.builder()
                .shipmentId(updatedShipment.getShipmentId())
                .shippingIntentId(updatedShipment.getShippingIntentId().getShipping_intent_id())
                .driverId(updatedShipment.getDriverId().getDriver_id())
                .vehicleId(updatedShipment.getVehicleId().getVehicle_id())
                .trackingNumber(updatedShipment.getTrackingNumber())
                .status(updatedShipment.getStatus().name())
                .startedAt(updatedShipment.getStartedAt())
                .deliveredAt(updatedShipment.getDeliveredAt())
                .build();

        return shipmentDTO;
    }


    public String deleteShipment(Integer shipmentId) {

        // Check if shipment exists
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException(
                        "Shipment not found with ID: " + shipmentId));

        // Prevent deletion if already DELIVERED
        if (shipment.getStatus() == ShippingStatus.DELIVERED) {
            throw new RuntimeException("Cannot delete a delivered shipment");
        }

        // Delete shipment
        shipmentRepository.delete(shipment);

        // Return message
        return "Shipment deleted successfully";
    }

}
