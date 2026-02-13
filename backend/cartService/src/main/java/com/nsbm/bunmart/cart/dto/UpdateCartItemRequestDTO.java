package com.nsbm.bunmart.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class UpdateCartItemRequestDTO {
    @Min(0)
    @NotNull
    private Integer quantity;

    public UpdateCartItemRequestDTO() {
    }

    public UpdateCartItemRequestDTO(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
