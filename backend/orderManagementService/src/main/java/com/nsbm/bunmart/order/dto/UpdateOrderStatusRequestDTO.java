package com.nsbm.bunmart.order.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateOrderStatusRequestDTO {

    @NotBlank(message = "Status is required")
    private String status;

    public UpdateOrderStatusRequestDTO() {
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
