package com.nsbm.bunmart.shipping.controller;

import com.nsbm.bunmart.shipping.dto.CreateDriverRequestDTO;
import com.nsbm.bunmart.shipping.dto.DriverResponseDTO;
import com.nsbm.bunmart.shipping.dto.UpdateDriverRequestDTO;
import com.nsbm.bunmart.shipping.mappers.rest.ShippingMapper;
import com.nsbm.bunmart.shipping.model.Driver;
import com.nsbm.bunmart.shipping.services.DriverService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/shipping/drivers")
public class DriverController {

    private final DriverService driverService;
    private final ShippingMapper shippingMapper;

    public DriverController(DriverService driverService, ShippingMapper shippingMapper) {
        this.driverService = driverService;
        this.shippingMapper = shippingMapper;
    }

    @PostMapping
    public ResponseEntity<DriverResponseDTO> addDriver(@Valid @RequestBody CreateDriverRequestDTO dto) {
        Driver driver = driverService.createDriver(
                dto.getFullName(),
                dto.getAge(),
                dto.getPhone(),
                dto.getVehicle(),
                dto.getCargoSize(),
                dto.getMaxWeight()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(shippingMapper.toDriverResponseDTO(driver));
    }

    @GetMapping
    public List<DriverResponseDTO> getAllDrivers() {
        return driverService.getAllDrivers().stream()
                .map(shippingMapper::toDriverResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DriverResponseDTO> getDriver(@PathVariable Integer id) {
        Driver driver = driverService.getDriver(id);
        return ResponseEntity.ok(shippingMapper.toDriverResponseDTO(driver));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DriverResponseDTO> updateDriver(@PathVariable Integer id,
                                                          @Valid @RequestBody UpdateDriverRequestDTO dto) {
        Driver driver = driverService.updateDriver(
                id,
                dto.getFullName(),
                dto.getAge(),
                dto.getPhone(),
                dto.getActive(),
                dto.getVehicle(),
                dto.getCargoSize(),
                dto.getMaxWeight()
        );
        return ResponseEntity.ok(shippingMapper.toDriverResponseDTO(driver));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDriver(@PathVariable Integer id) {
        driverService.deleteDriver(id);
        return ResponseEntity.noContent().build();
    }
}
