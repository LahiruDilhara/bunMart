package com.nsbm.bunmart.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;


public class CheckoutRequestDTO {

    @NotEmpty(message = "Items list cannot be empty")
    private List<@NotNull(message="Item id cannot be null") @Min(value=1, message="Item id must be positive") Integer> itemIds;

    public List<Integer> getItemIds() {
        return itemIds;
    }

    public void setItemIds(List<Integer> itemIds) {
        this.itemIds = itemIds;
    }
}

