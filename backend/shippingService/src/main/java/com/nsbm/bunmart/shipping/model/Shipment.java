package com.nsbm.bunmart.shipping.model;

import java.time.LocalDateTime;

public class Shipment {

    private Long shipment_id;
    private Long shipping_intent_id;
    private Long driver_id;
    private Long tracking_number;
    private ShippingIntentStatus status;
    private LocalDateTime started_at;
    private LocalDateTime delivered_at;
}
