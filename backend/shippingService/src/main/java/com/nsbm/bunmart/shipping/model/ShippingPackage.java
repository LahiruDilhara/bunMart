package com.nsbm.bunmart.shipping.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "shipping_packages")
public class ShippingPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "weight", nullable = false)
    private Double weight;

    @Column(name = "destination_address", nullable = false, length = 500)
    private String destinationAddress;

    @Column(name = "source_address", nullable = false, length = 500)
    private String sourceAddress;

    @Column(name = "total_price", precision = 19, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "order_id", nullable = false)
    private String orderId;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "shipped_at")
    private Instant shippedAt;

    @Column(name = "progress")
    private Integer progress = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ShippingPackageStatus status = ShippingPackageStatus.CREATED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Driver driver;
}
