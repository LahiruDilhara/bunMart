package com.nsbm.bunmart.kitchen.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateLineStatusRequestDTO {

    @NotBlank(message = "Status is required")
    private String status; // PENDING, IN_PROGRESS, DONE

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
