package com.nsbm.bunmart.shipping.model;

import java.time.LocalDateTime;

public class ShippingIntent {

    private Long shipping_intent_id;
    private Long orderId;
    private Long userId;
    private Long addressId;
    private ShippingStatus status;
    private LocalDateTime created_at;
}
