package com.nsbm.bunmart.shipping.services;

import com.nsbm.bunmart.notification.v1.NotificationServiceGrpc;
import com.nsbm.bunmart.notification.v1.SendNotificationRequest;
import com.nsbm.bunmart.order.v1.OrderServiceGrpc;
import com.nsbm.bunmart.order.v1.UpdateOrderRequest;
import com.nsbm.bunmart.shipping.dto.CreateShippingPackageRequestDTO;
import com.nsbm.bunmart.shipping.errors.DuplicateOrderIdException;
import com.nsbm.bunmart.shipping.errors.ShippingPackageNotSavedException;
import com.nsbm.bunmart.shipping.errors.ShippingPackageNotFoundException;
import com.nsbm.bunmart.shipping.errors.DeliveryAlreadyCompletedException;
import com.nsbm.bunmart.shipping.model.Driver;
import com.nsbm.bunmart.shipping.model.ShippingPackage;
import com.nsbm.bunmart.shipping.model.ShippingPackageStatus;
import com.nsbm.bunmart.shipping.repositories.ShippingPackageRepository;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
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

    @GrpcClient("notificationService")
    private NotificationServiceGrpc.NotificationServiceBlockingStub notificationServiceStub;

    @GrpcClient("orderService")
    private OrderServiceGrpc.OrderServiceBlockingStub orderServiceStub;

    private final ShippingPackageRepository shippingPackageRepository;
    private final DriverService driverService;

    public ShippingPackageService(ShippingPackageRepository shippingPackageRepository,
                                  DriverService driverService) {
        this.shippingPackageRepository = shippingPackageRepository;
        this.driverService = driverService;
    }

    public ShippingPackage createShippingPackage(Double weight, String destinationAddress, String sourceAddress,
                                                  BigDecimal totalPrice, String orderId, String userId, Integer driverId) {
        if (!shippingPackageRepository.findByOrderId(orderId).isEmpty()) {
            throw new DuplicateOrderIdException("A shipping package already exists for orderId: " + orderId);
        }
        ShippingPackage pkg = new ShippingPackage();
        pkg.setWeight(weight);
        pkg.setDestinationAddress(destinationAddress);
        pkg.setSourceAddress(sourceAddress);
        pkg.setTotalPrice(totalPrice);
        pkg.setOrderId(orderId);
        pkg.setUserId(userId);
        pkg.setShippedAt(Instant.now());
        pkg.setProgress(0);
        pkg.setStatus(ShippingPackageStatus.CREATED);
        if (driverId != null) {
            Driver driver = driverService.getDriver(driverId);
            pkg.setDriver(driver);
        }
        try {
            ShippingPackage saved = shippingPackageRepository.save(pkg);
            if (saved.getUserId() != null) {
                updateOrderShipped(saved.getOrderId(), saved.getUserId(), saved.getId());
                notifyOrderPlacedForShipping(saved.getUserId(), saved.getOrderId());
            }
            return saved;
        } catch (DataAccessException e) {
            log.error("Failed to save shipping package: {}", e.getMessage());
            throw new ShippingPackageNotSavedException("Failed to create shipping package");
        }
    }

    public ShippingPackage createShippingPackage(CreateShippingPackageRequestDTO dto) {
        return createShippingPackage(
                dto.getWeight(),
                dto.getDestinationAddress(),
                dto.getSourceAddress(),
                dto.getTotalPrice(),
                dto.getOrderId(),
                dto.getUserId(),
                dto.getDriverId()
        );
    }

    public ShippingPackage updateStatusAndProgress(String id, String status, Integer progress) {
        ShippingPackage pkg = getShippingPackage(id);
        if (status != null && !status.isBlank()) {
            try {
                pkg.setStatus(ShippingPackageStatus.valueOf(status.trim().toUpperCase().replace("-", "_")));
            } catch (IllegalArgumentException ignored) {
                // keep current status if invalid
            }
        }
        if (progress != null) {
            int value = Math.max(0, Math.min(100, progress));
            pkg.setProgress(value);
            if (value == 100) {
                pkg.setStatus(ShippingPackageStatus.DELIVERED);
            } else if (pkg.getStatus() == ShippingPackageStatus.CREATED) {
                pkg.setStatus(ShippingPackageStatus.IN_TRANSIT);
            }
        }
        try {
            ShippingPackage saved = shippingPackageRepository.save(pkg);
            if (saved.getStatus() == ShippingPackageStatus.DELIVERED && saved.getUserId() != null) {
                updateOrderDelivered(saved.getOrderId(), saved.getUserId());
                notifyShipmentDelivered(saved.getUserId(), saved.getOrderId());
            }
            return saved;
        } catch (DataAccessException e) {
            log.error("Failed to update shipping package status: {}", e.getMessage());
            throw new ShippingPackageNotSavedException("Failed to update status");
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

    public List<ShippingPackage> getShippingPackagesByDriverId(Integer driverId) {
        return shippingPackageRepository.findByDriver_Id(driverId);
    }

    public ShippingPackage assignDriver(String packageId, Integer driverId) {
        ShippingPackage pkg = getShippingPackage(packageId);
        if (pkg.getStatus() == ShippingPackageStatus.DELIVERED) {
            throw new DeliveryAlreadyCompletedException(
                    "Cannot change driver: this package is already delivered. The delivery is over.");
        }
        Driver driver = driverService.getDriver(driverId);
        pkg.setDriver(driver);
        try {
            return shippingPackageRepository.save(pkg);
        } catch (DataAccessException e) {
            log.error("Failed to assign driver: {}", e.getMessage());
            throw new ShippingPackageNotSavedException("Failed to assign driver");
        }
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
            ShippingPackage saved = shippingPackageRepository.save(pkg);
            if (saved.getStatus() == ShippingPackageStatus.DELIVERED && saved.getUserId() != null) {
                updateOrderDelivered(saved.getOrderId(), saved.getUserId());
                notifyShipmentDelivered(saved.getUserId(), saved.getOrderId());
            }
            return saved;
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

    private void notifyShipmentDelivered(String userId, String orderId) {
        try {
            SendNotificationRequest req = SendNotificationRequest.newBuilder()
                    .setUserId(userId)
                    .setChannel("IN_APP")
                    .setTemplateId("1")
                    .putTemplateData("title", "Order delivered")
                    .putTemplateData("message", "Your order #" + orderId + " has been delivered.")
                    .setSubject("Order delivered")
                    .setReferenceType("ORDER")
                    .setReferenceId(orderId != null ? orderId : "")
                    .build();
            notificationServiceStub.sendNotification(req);
            log.info("Notified user {} that order {} has been delivered", userId, orderId);
        } catch (Exception e) {
            log.warn("Failed to send delivery notification: {}", e.getMessage());
        }
    }

    private void notifyOrderPlacedForShipping(String userId, String orderId) {
        try {
            SendNotificationRequest req = SendNotificationRequest.newBuilder()
                    .setUserId(userId)
                    .setChannel("IN_APP")
                    .setTemplateId("1")
                    .putTemplateData("title", "Order placed for shipping")
                    .putTemplateData("message", "Your order #" + orderId + " has been placed for shipping.")
                    .setSubject("Order placed for shipping")
                    .setReferenceType("ORDER")
                    .setReferenceId(orderId != null ? orderId : "")
                    .build();
            notificationServiceStub.sendNotification(req);
            log.info("Notified user {} that order {} was placed for shipping", userId, orderId);
        } catch (Exception e) {
            log.warn("Failed to send order-placed-for-shipping notification: {}", e.getMessage());
        }
    }

    /** Update order in order service via gRPC: set shipment_id and status to SHIPPED. */
    private void updateOrderShipped(String orderId, String userId, String shipmentId) {
        try {
            UpdateOrderRequest req = UpdateOrderRequest.newBuilder()
                    .setOrderId(orderId)
                    .setUserId(userId)
                    .setShipmentId(shipmentId != null ? shipmentId : "")
                    .setStatus("shipped")
                    .build();
            orderServiceStub.updateOrder(req);
            log.info("Updated order {} with shipmentId={} and status=shipped", orderId, shipmentId);
        } catch (Exception e) {
            log.warn("Failed to update order {} to shipped: {}", orderId, e.getMessage());
        }
    }

    /** Update order in order service via gRPC: set status to DELIVERED. */
    private void updateOrderDelivered(String orderId, String userId) {
        try {
            UpdateOrderRequest req = UpdateOrderRequest.newBuilder()
                    .setOrderId(orderId)
                    .setUserId(userId)
                    .setStatus("delivered")
                    .build();
            orderServiceStub.updateOrder(req);
            log.info("Updated order {} status to delivered", orderId);
        } catch (Exception e) {
            log.warn("Failed to update order {} to delivered: {}", orderId, e.getMessage());
        }
    }
}
