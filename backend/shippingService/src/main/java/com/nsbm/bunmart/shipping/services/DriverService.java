package com.nsbm.bunmart.shipping.services;

import com.nsbm.bunmart.shipping.dto.DriverDTO;
import com.nsbm.bunmart.shipping.interfaces.DriverInterface;
import com.nsbm.bunmart.shipping.model.Driver;
import com.nsbm.bunmart.shipping.repositories.DriverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    public String getAllDrivers(){
        return "Get All Driver";
    }

    public String getDriverById(){
        return "Driver Details";
    }

    public String updateDriver(){
        return "Update Driver";
    }

    public String deleteDriver(){
        return "Delete Driver";
    }
}
