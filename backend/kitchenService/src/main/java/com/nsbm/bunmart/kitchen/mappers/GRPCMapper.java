package com.nsbm.bunmart.kitchen.mappers;

import com.nsbm.bunmart.kitchen.model.KitchenOrder;
import com.nsbm.bunmart.kitchen.model.KitchenStatus;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Component
public class GRPCMapper {

    /**
     * Maps Order Service gRPC response
     * into KitchenOrder JPA entity
     */
    public KitchenOrder mapOrderResponseToEntity(OrderResponse response) {

        KitchenOrder order = new KitchenOrder();

        // Use Order ID from Order Service
        order.setId(response.getOrderId());

        // Default Kitchen Status when created
        order.setStatus(KitchenStatus.PENDING);

        // Convert protobuf timestamp to LocalDateTime
        if (response.hasCreatedAt()) {
            Instant instant = Instant.ofEpochSecond(
                    response.getCreatedAt().getSeconds(),
                    response.getCreatedAt().getNanos()
            );
            order.setCreatedAt(
                    LocalDateTime.ofInstant(instant, ZoneId.systemDefault())
            );
        } else {
            order.setCreatedAt(LocalDateTime.now());
        }

        return order;
    }
}