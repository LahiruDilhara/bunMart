package com.nsbm.bunmart.shipping.services;

import com.nsbm.bunmart.shipping.errors.DuplicateOrderIdException;
import com.nsbm.bunmart.shipping.errors.ShippingPackageNotSavedException;
import com.nsbm.bunmart.shipping.errors.ShippingPackageNotFoundException;
import com.nsbm.bunmart.shipping.model.Driver;
import com.nsbm.bunmart.shipping.model.ShippingPackage;
import com.nsbm.bunmart.shipping.model.ShippingPackageStatus;
import com.nsbm.bunmart.shipping.repositories.ShippingPackageRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@Transactional
public class ShippingPackageService {

    private final ShippingPackageRepository shippingPackageRepository;
    private final DriverService driverService;

    public ShippingPackageService(ShippingPackageRepository shippingPackageRepository,
                                  DriverService driverService) {
        this.shippingPackageRepository = shippingPackageRepository;
        this.driverService = driverService;
    }

    public ShippingPackage createShippingPackage(Double weight, String destinationAddress, String sourceAddress,
                                                  BigDecimal totalPrice, String orderId, Integer driverId) {
        if (!shippingPackageRepository.findByOrderId(orderId).isEmpty()) {
            throw new DuplicateOrderIdException("A shipping package already exists for orderId: " + orderId);
        }
        ShippingPackage pkg = new ShippingPackage();
        pkg.setWeight(weight);
        pkg.setDestinationAddress(destinationAddress);
        pkg.setSourceAddress(sourceAddress);
        pkg.setTotalPrice(totalPrice);
        pkg.setOrderId(orderId);
        pkg.setShippedAt(Instant.now());
        pkg.setProgress(0);
        pkg.setStatus(ShippingPackageStatus.CREATED);
        if (driverId != null) {
            Driver driver = driverService.getDriver(driverId);
            pkg.setDriver(driver);
        }
        try {
            return shippingPackageRepository.save(pkg);
        } catch (DataAccessException e) {
            log.error("Failed to save shipping package: {}", e.getMessage());
            throw new ShippingPackageNotSavedException("Failed to create shipping package");
        }
    }

    public ShippingPackage getShippingPackage(String id) {
        return shippingPackageRepository.findById(id)
                .orElseThrow(() -> new ShippingPackageNotFoundException("Shipping package not found: " + id));
    }

    public List<ShippingPackage> getAllShippingPackages() {
        return shippingPackageRepository.findAll();
    }

    public List<ShippingPackage> getShippingPackagesByOrderId(String orderId) {
        return shippingPackageRepository.findByOrderId(orderId);
    }

    public ShippingPackage updateProgress(String id, Integer progress) {
        ShippingPackage pkg = getShippingPackage(id);
        int value = progress != null ? Math.max(0, Math.min(100, progress)) : 0;
        pkg.setProgress(value);
        if (value == 100) {
            pkg.setStatus(ShippingPackageStatus.DELIVERED);
        } else if (pkg.getStatus() == ShippingPackageStatus.CREATED) {
            pkg.setStatus(ShippingPackageStatus.IN_TRANSIT);
        }
        try {
            return shippingPackageRepository.save(pkg);
        } catch (DataAccessException e) {
            log.error("Failed to update shipping package progress: {}", e.getMessage());
            throw new ShippingPackageNotSavedException("Failed to update progress");
        }
    }

    public ShippingPackage stopShipping(String id) {
        ShippingPackage pkg = getShippingPackage(id);
        pkg.setStatus(ShippingPackageStatus.STOPPED);
        try {
            return shippingPackageRepository.save(pkg);
        } catch (DataAccessException e) {
            log.error("Failed to stop shipping: {}", e.getMessage());
            throw new ShippingPackageNotSavedException("Failed to stop shipping");
        }
    }

    public void deleteShippingPackage(String id) {
        ShippingPackage pkg = getShippingPackage(id);
        try {
            shippingPackageRepository.delete(pkg);
        } catch (DataAccessException e) {
            log.error("Failed to delete shipping package: {}", e.getMessage());
            throw new ShippingPackageNotSavedException("Failed to delete shipping package");
        }
    }
}
