package com.nsbm.bunmart.shipping.dto;

import com.nsbm.bunmart.shipping.model.Driver;
import com.nsbm.bunmart.shipping.model.ShippingIntent;
import com.nsbm.bunmart.shipping.model.ShippingStatus;
import com.nsbm.bunmart.shipping.model.Vehicle;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentDTO {

    private Integer shipmentId;

    private Integer shippingIntentId;   // Only ID
    private Integer driverId;           // Only ID
    private Integer vehicleId;          // Only ID

    private Integer trackingNumber;
    private String status;              // Or ShippingStatus if you prefer
    private LocalDateTime startedAt;
    private LocalDateTime deliveredAt;

}
