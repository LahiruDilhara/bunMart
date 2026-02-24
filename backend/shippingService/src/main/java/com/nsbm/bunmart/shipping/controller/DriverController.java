package com.nsbm.bunmart.shipping.controller;

import com.nsbm.bunmart.shipping.dto.DriverDTO;
import com.nsbm.bunmart.shipping.services.DriverService;
import jakarta.persistence.criteria.CriteriaBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/shipping/driver")
public class DriverController {

    @Autowired
    private DriverService driverService;

    @PostMapping("create-driver")
    public DriverDTO createDriver(@RequestBody DriverDTO driverDTO) {
        return driverService.createDriver(driverDTO);
    }

    @GetMapping("all-drivers")
    public List<DriverDTO> getAllDrivers(){
        return driverService.getAllDrivers();
    }

    @GetMapping("/{driverId}")
    public ResponseEntity<DriverDTO> getDriverById(@PathVariable Integer driverId) {
        DriverDTO driverDTO = driverService.getDriverById(driverId);
        return ResponseEntity.ok(driverDTO);
    }
}
