package com.nsbm.bunmart.shipping.controller;

import com.nsbm.bunmart.shipping.dto.VehicleDTO;
import com.nsbm.bunmart.shipping.services.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/shipping/vehicle")
@CrossOrigin(origins = "*")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    @PostMapping("create-vehicle")
    public ResponseEntity<VehicleDTO> createVehicle(@RequestBody VehicleDTO vehicleDTO){
        return ResponseEntity.ok(vehicleService.createVehicle(vehicleDTO));
    }

    @GetMapping("all-vehicles")
    public List<VehicleDTO> getAllVehicles(){
        return vehicleService.getAllVehicles();
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<VehicleDTO> getVehicleById(@PathVariable Integer vehicleId){
        VehicleDTO vehicleDTO =  vehicleService.getVehicleById(vehicleId);
        return ResponseEntity.ok(vehicleDTO);
    }

    @PutMapping("/{vehicleId}")
    public ResponseEntity<VehicleDTO> updateVehicle(@PathVariable Integer vehicleId, @RequestBody VehicleDTO vehicleDTO){
        VehicleDTO vehicleDTO1 =  vehicleService.updateVehicle(vehicleId, vehicleDTO);
        return ResponseEntity.ok(vehicleDTO1);
    }

    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<String> deleteVehicle(@PathVariable Integer vehicleId){
        String message = vehicleService.deleteVehicle(vehicleId);
        return ResponseEntity.ok(message);
    }
}
