package com.nsbm.bunmart.shipping.mappers.rest;

import com.nsbm.bunmart.shipping.dto.DriverResponseDTO;
import com.nsbm.bunmart.shipping.dto.ShippingPackageResponseDTO;
import com.nsbm.bunmart.shipping.model.Driver;
import com.nsbm.bunmart.shipping.model.ShippingPackage;
import org.springframework.stereotype.Component;

@Component
public class ShippingMapper {

    public DriverResponseDTO toDriverResponseDTO(Driver driver) {
        if (driver == null) return null;
        DriverResponseDTO dto = new DriverResponseDTO();
        dto.setId(driver.getId());
        dto.setFullName(driver.getFullName());
        dto.setAge(driver.getAge());
        dto.setPhone(driver.getPhone());
        dto.setActive(driver.isActive());
        dto.setVehicle(driver.getVehicle());
        dto.setCargoSize(driver.getCargoSize());
        dto.setMaxWeight(driver.getMaxWeight());
        return dto;
    }

    public ShippingPackageResponseDTO toShippingPackageResponseDTO(ShippingPackage pkg) {
        if (pkg == null) return null;
        ShippingPackageResponseDTO dto = new ShippingPackageResponseDTO();
        dto.setId(pkg.getId());
        dto.setWeight(pkg.getWeight());
        dto.setDestinationAddress(pkg.getDestinationAddress());
        dto.setSourceAddress(pkg.getSourceAddress());
        dto.setTotalPrice(pkg.getTotalPrice());
        dto.setOrderId(pkg.getOrderId());
        dto.setShippedAt(pkg.getShippedAt());
        dto.setProgress(pkg.getProgress());
        dto.setStatus(pkg.getStatus());
        if (pkg.getDriver() != null) {
            dto.setDriverId(pkg.getDriver().getId());
            dto.setDriverFullName(pkg.getDriver().getFullName());
        }
        return dto;
    }
}
