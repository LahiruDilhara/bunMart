package com.nsbm.bunmart.cart.dto;

public class CheckoutResponseDTO {

    private String orderId;

    public CheckoutResponseDTO(String orderId) {
        this.orderId = orderId;
    }

    public CheckoutResponseDTO() {
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }
}
