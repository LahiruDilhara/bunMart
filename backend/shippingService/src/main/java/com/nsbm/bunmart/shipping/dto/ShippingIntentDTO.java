package com.nsbm.bunmart.shipping.dto;

import com.nsbm.bunmart.shipping.model.ShippingStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShippingIntentDTO {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer shipping_intent_id;

    private Integer orderId;
    private Integer userId;
    private Integer addressId;

    @Enumerated(EnumType.STRING)
    private ShippingStatus status;
    private LocalDateTime created_at;

    public Integer getShipping_intent_id() {
        return shipping_intent_id;
    }

    public void setShipping_intent_id(Integer shipping_intent_id) {
        this.shipping_intent_id = shipping_intent_id;
    }

    public Integer getOrderId() {
        return orderId;
    }

    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getAddressId() {
        return addressId;
    }

    public void setAddressId(Integer addressId) {
        this.addressId = addressId;
    }

    public ShippingStatus getStatus() {
        return status;
    }

    public void setStatus(ShippingStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreated_at() {
        return created_at;
    }

    public void setCreated_at(LocalDateTime created_at) {
        this.created_at = created_at;
    }
}
