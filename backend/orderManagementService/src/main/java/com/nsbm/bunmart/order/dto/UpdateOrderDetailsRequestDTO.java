package com.nsbm.bunmart.order.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public class UpdateOrderDetailsRequestDTO {

    private List<String> couponCodes;

    @NotBlank(message = "Address ID is required")
    private String addressId;

    public UpdateOrderDetailsRequestDTO() {
    }

    public List<String> getCouponCodes() {
        return couponCodes;
    }

    public void setCouponCodes(List<String> couponCodes) {
        this.couponCodes = couponCodes;
    }

    public String getAddressId() {
        return addressId;
    }

    public void setAddressId(String addressId) {
        this.addressId = addressId;
    }
}
