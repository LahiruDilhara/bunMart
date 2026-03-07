package com.nsbm.bunmart.pricing.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalculatePriceRequestDTO {
    @NotEmpty(message = "Items list is required")
    private List<@NotNull @Valid LineItemDTO> items;

    /** Optional coupon code for order-level discount (coupon with null productId). */
    private String couponCode;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LineItemDTO {
        @NotNull(message = "Product ID is required")
        private String productId;
        @NotNull(message = "Quantity is required")
        private Integer quantity;
    }
}
