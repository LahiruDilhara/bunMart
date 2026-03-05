package com.nsbm.bunmart.shipping.dto;

import com.nsbm.bunmart.shipping.model.ShippingPackageStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShippingPackageResponseDTO {
    private String id;
    private Double weight;
    private String destinationAddress;
    private String sourceAddress;
    private BigDecimal totalPrice;
    private String orderId;
    private Instant shippedAt;
    private Integer progress;
    private ShippingPackageStatus status;
    private Integer driverId;
    private String driverFullName;
}
