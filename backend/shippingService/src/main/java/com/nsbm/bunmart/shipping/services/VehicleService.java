package com.nsbm.bunmart.shipping.services;

import com.nsbm.bunmart.shipping.dto.VehicleDTO;
import com.nsbm.bunmart.shipping.model.Vehicle;
import com.nsbm.bunmart.shipping.repositories.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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


}
