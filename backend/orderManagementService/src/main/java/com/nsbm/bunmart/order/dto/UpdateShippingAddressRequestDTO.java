package com.nsbm.bunmart.order.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateShippingAddressRequestDTO {

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    public UpdateShippingAddressRequestDTO() {
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }
}
