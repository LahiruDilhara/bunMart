package com.nsbm.bunmart.shipping.services;

import com.nsbm.bunmart.shipping.errors.DriverNotFoundException;
import com.nsbm.bunmart.shipping.model.Driver;
import com.nsbm.bunmart.shipping.repositories.DriverRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@Transactional
public class DriverService {

    private final DriverRepository driverRepository;

    public DriverService(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    public Driver createDriver(String fullName, Integer age, String phone, String vehicle, Integer cargoSize, Double maxWeight) {
        Driver driver = new Driver();
        driver.setFullName(fullName);
        driver.setAge(age);
        driver.setPhone(phone);
        driver.setActive(true);
        driver.setVehicle(vehicle);
        driver.setCargoSize(cargoSize);
        driver.setMaxWeight(maxWeight);
        return driverRepository.save(driver);
    }

    public Driver getDriver(Integer id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new DriverNotFoundException("Driver not found: " + id));
    }

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public Driver updateDriver(Integer id, String fullName, Integer age, String phone, Boolean active,
                              String vehicle, Integer cargoSize, Double maxWeight) {
        Driver driver = getDriver(id);
        if (fullName != null) driver.setFullName(fullName);
        if (age != null) driver.setAge(age);
        if (phone != null) driver.setPhone(phone);
        if (active != null) driver.setActive(active);
        if (vehicle != null) driver.setVehicle(vehicle);
        if (cargoSize != null) driver.setCargoSize(cargoSize);
        if (maxWeight != null) driver.setMaxWeight(maxWeight);
        return driverRepository.save(driver);
    }

    public void deleteDriver(Integer id) {
        Driver driver = getDriver(id);
        driverRepository.delete(driver);
    }
}
