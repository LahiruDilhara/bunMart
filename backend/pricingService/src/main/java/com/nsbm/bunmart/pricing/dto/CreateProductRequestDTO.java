package com.nsbm.bunmart.pricing.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequestDTO {
    @NotBlank(message = "Product ID is required")
    private String id;
    @NotBlank(message = "Name is required")
    private String name;
    @NotNull(message = "Raw price is required")
    @DecimalMin(value = "0", message = "Raw price must be 0 or greater")
    private BigDecimal rawPrice;
    @NotNull(message = "Tax is required")
    @DecimalMin(value = "0", message = "Tax must be 0 or greater")
    private BigDecimal tax;
    @NotNull(message = "Shipping cost is required")
    @DecimalMin(value = "0", message = "Shipping cost must be 0 or greater")
    private BigDecimal shippingCost;
    private String currencyCode;
}
