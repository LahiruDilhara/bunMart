package com.nsbm.bunmart.shipping.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@Table(name = "shipping_intents")
public class ShippingIntent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer shipping_intent_id;

    private Integer orderId;
    private Integer userId;
    private Integer addressId;

    @Enumerated(EnumType.STRING)
    private ShippingIntentStatus status;

    private LocalDateTime created_at;

}