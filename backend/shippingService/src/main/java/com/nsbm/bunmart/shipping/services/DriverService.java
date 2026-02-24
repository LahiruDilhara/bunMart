package com.nsbm.bunmart.shipping.services;

import com.nsbm.bunmart.shipping.dto.DriverDTO;
import com.nsbm.bunmart.shipping.interfaces.DriverInterface;
import com.nsbm.bunmart.shipping.model.Driver;
import com.nsbm.bunmart.shipping.repositories.DriverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DriverService implements DriverInterface {

    @Autowired
    private DriverRepository driverRepository;

    @Override
    public DriverDTO createDriver(DriverDTO driverDTO){
        Driver driver = new Driver(
                null,
                driverDTO.getName(),
                driverDTO.getPhone(),
                driverDTO.isActive()
        );

        Driver savedDriver =  driverRepository.save(driver);

        DriverDTO response = new DriverDTO(
                savedDriver.getDriver_id(),
                savedDriver.getName(),
                savedDriver.getPhone(),
                savedDriver.isActive()
        );

        return response;
    }

    @Override
    public List<DriverDTO> getAllDrivers(){
        List<DriverDTO> drivers = driverRepository.findAll()
                .stream()
                .map(driver -> DriverDTO.builder()
                        .driver_id(driver.getDriver_id())
                        .name(driver.getName())
                        .phone(driver.getPhone())
                        .active(driver.isActive())
                        .build())
                .toList();

        return drivers;
    }

    public DriverDTO getDriverById(Integer driverID){

        // Fetch driver from DB
        Driver driver = driverRepository.findById(Long.valueOf(driverID)).orElseThrow(() -> new RuntimeException("Driver Not Found"));

        // Convert entity to DTO
        DriverDTO driverDTO = DriverDTO.builder()
                .driver_id(driver.getDriver_id())
                .name(driver.getName())
                .phone(driver.getPhone())
                .active(driver.isActive())
                .build();

        return driverDTO;
    }

    public DriverDTO updateDriver(Integer driverId, DriverDTO driverDTO){

        Driver driver = driverRepository.findById(Long.valueOf(driverId)).orElseThrow(() -> new RuntimeException("Driver Not Found"));

        // Update fields
        driver.setName(driverDTO.getName());
        driver.setPhone(driverDTO.getPhone());
        driver.setActive(driverDTO.isActive());

        // Save updated entity
        Driver updatedDriver = driverRepository.save(driver);

        // Convert to DTO and return
        DriverDTO driverDTO1 =  DriverDTO.builder()
                .driver_id(updatedDriver.getDriver_id())
                .name(updatedDriver.getName())
                .phone(updatedDriver.getPhone())
                .active(updatedDriver.isActive())
                .build();

        return driverDTO1;
    }

    public String deleteDriver(){
        return "Delete Driver";
    }
}
