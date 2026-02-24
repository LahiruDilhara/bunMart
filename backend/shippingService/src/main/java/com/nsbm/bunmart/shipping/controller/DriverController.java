package com.nsbm.bunmart.shipping.controller;

import com.nsbm.bunmart.shipping.dto.DriverDTO;
import com.nsbm.bunmart.shipping.services.DriverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/shipping/driver")
public class DriverController {

    @Autowired
    private DriverService driverService;

    @PostMapping("create-driver")
    public DriverDTO createDriver(@RequestBody DriverDTO driverDTO) {
        return driverService.createDriver(driverDTO);
    }
}
