package com.nsbm.bunmart.shipping.controller;

import com.nsbm.bunmart.shipping.dto.VehicleDTO;
import com.nsbm.bunmart.shipping.services.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/shipping/vehicle")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    @PostMapping("create-vehicle")
    public ResponseEntity<VehicleDTO> createVehicle(@RequestBody VehicleDTO vehicleDTO){
        return ResponseEntity.ok(vehicleService.createVehicle(vehicleDTO));
    }

    @GetMapping("all-vehic")
    public List<VehicleDTO> getAllVehicles(){
        return vehicleService.getAllVehicles();
    }

}
