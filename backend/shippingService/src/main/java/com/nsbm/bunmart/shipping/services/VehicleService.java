package com.nsbm.bunmart.shipping.services;

import com.nsbm.bunmart.shipping.dto.VehicleDTO;
import com.nsbm.bunmart.shipping.model.Vehicle;
import com.nsbm.bunmart.shipping.repositories.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    public VehicleDTO createVehicle(VehicleDTO vehicleDTO){

        Vehicle vehicle = new Vehicle(
                null,
                vehicleDTO.getPlate_number(),
                vehicleDTO.getType(),
                vehicleDTO.isActive()
        );

        Vehicle savedVehicle = vehicleRepository.save(vehicle);

        VehicleDTO response = new VehicleDTO(
                savedVehicle.getVehicle_id(),
                savedVehicle.getPlate_number(),
                savedVehicle.getType(),
                savedVehicle.isActive()
        );

        return response;
    }

    public List<VehicleDTO>getAllVehicles(){

        List<VehicleDTO> vehicles = vehicleRepository.findAll()
                .stream()
                .map(vehicle -> VehicleDTO.builder()
                        .vehicle_id(vehicle.getVehicle_id())
                        .plate_number(vehicle.getPlate_number())
                        .type(vehicle.getType())
                        .active(vehicle.isActive())
                        .build())
                .toList();

        return vehicles;

    }

    public VehicleDTO getVehicleById(Integer vehicleId){

        // Fetch driver from DB
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElseThrow(() -> new RuntimeException("Vehicle Not Found"));

        // Convert entity to DTO
        VehicleDTO vehicleDTO = VehicleDTO.builder()
                .vehicle_id(vehicle.getVehicle_id())
                .plate_number(vehicle.getPlate_number())
                .type(vehicle.getType())
                .active(vehicle.isActive())
                .build();

        return vehicleDTO;

    }

    public VehicleDTO updateVehicle(Integer vehicleId, VehicleDTO vehicleDTO){

        // Fetch driver from DB
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElseThrow(() -> new RuntimeException("Vehicle Not Found"));

        // Update fields
        vehicle.setPlate_number(vehicleDTO.getPlate_number());
        vehicle.setType(vehicleDTO.getType());
        vehicle.setActive(vehicleDTO.isActive());

        // Save updated entity
        Vehicle updateVehicle = vehicleRepository.save(vehicle);

        // Convert to DTO and return
        VehicleDTO vehicleDTO1 = VehicleDTO.builder()
                .vehicle_id(updateVehicle.getVehicle_id())
                .plate_number(updateVehicle.getPlate_number())
                .type(updateVehicle.getType())
                .active(updateVehicle.isActive())
                .build();

        return vehicleDTO1;
    }

    public String deleteVehicle(Integer vehicleId){

        // Check if movie object exists inDB
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, ("Vehicle Not Found")));

        vehicleRepository.delete(vehicle);

        return "Vehicle deleted successfully";

    }




}
