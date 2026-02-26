package com.nsbm.bunmart.shipping.dto;


import com.nsbm.bunmart.shipping.model.ShippingIntentStatus;
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
public class ShippingIntentDTO {


    private Integer shipping_intent_id;
    private Integer orderId;
    private Integer userId;
    private Integer addressId;

    @Enumerated(EnumType.STRING)
    private ShippingIntentStatus status;
    private LocalDateTime created_at;

}
