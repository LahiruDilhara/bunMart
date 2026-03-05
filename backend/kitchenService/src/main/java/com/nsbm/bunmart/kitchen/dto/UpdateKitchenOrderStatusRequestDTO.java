package com.nsbm.bunmart.kitchen.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateKitchenOrderStatusRequestDTO {

    @NotBlank(message = "Status is required")
    private String status; // ACTIVE, STOPPED, COMPLETED

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
