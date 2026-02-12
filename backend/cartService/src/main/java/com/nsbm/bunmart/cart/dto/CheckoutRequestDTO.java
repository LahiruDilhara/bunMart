package com.nsbm.bunmart.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;


public class CheckoutRequestDTO {

    @NotEmpty(message = "ProductIds list cannot be empty")
    private List<@NotBlank(message = "Product id cannot be blank") String> productIds;

    public List<String> getProductIds() {
        return productIds;
    }

    public void setProductIds(List<String> productIds) {
        this.productIds = productIds;
    }
}

