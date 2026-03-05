package com.nsbm.bunmart.kitchen.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateKitchenOrderRequestDTO {

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Order ID is required")
    private String orderId;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
}
