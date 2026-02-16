package com.nsbm.bunmart.shipping.interfaces;

import com.nsbm.bunmart.shipping.dto.DriverDTO;

import java.util.List;

public interface DriverInterface {
    DriverDTO createDriver(DriverDTO driverDTO);
    List<DriverDTO> getAllDrivers();
    DriverDTO getDriverById(Long id);
    DriverDTO updateDriver(Long id, DriverDTO driverDTO);
    void deleteDriver(Long id);

}
