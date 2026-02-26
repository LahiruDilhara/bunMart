package com.nsbm.bunmart.shipping.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "shipments")
@Builder
public class Shipment {

//    private Integer shipment_id;
//    private Integer shipping_intent_id;
//    private Integer driver_id;
//    private Integer tracking_number;
//    private ShippingStatus status;
//    private LocalDateTime started_at;
//    private LocalDateTime delivered_at;



    // ✅ Primary Key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer shipmentId;

    // ✅ Foreign Key - ShippingIntent
    @ManyToOne
    @JoinColumn(name = "shipping_intent_id", nullable = false)
    private ShippingIntent shippingIntentId;

    // ✅ Foreign Key - Driver
    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driverId;

    // ✅ Foreign Key - Vehicle
    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicleId;

    private Integer trackingNumber;

    @Enumerated(EnumType.STRING)
    private ShippingStatus status;

    private LocalDateTime startedAt;
    private LocalDateTime deliveredAt;

}
