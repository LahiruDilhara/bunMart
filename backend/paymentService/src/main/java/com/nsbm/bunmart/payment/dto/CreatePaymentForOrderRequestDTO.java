package com.nsbm.bunmart.payment.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request to create a payment for an order. The payment service will fetch order details
 * (total, currency) from the order service via gRPC and then create the payment.
 */
public class CreatePaymentForOrderRequestDTO {

    @NotBlank(message = "Order ID is required")
    private String orderId;

    @NotBlank(message = "User ID is required")
    private String userId;

    public CreatePaymentForOrderRequestDTO() {
    }

    public CreatePaymentForOrderRequestDTO(String orderId, String userId) {
        this.orderId = orderId;
        this.userId = userId;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
