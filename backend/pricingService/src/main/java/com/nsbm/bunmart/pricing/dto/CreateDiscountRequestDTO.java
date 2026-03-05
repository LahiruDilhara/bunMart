package com.nsbm.bunmart.pricing.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateDiscountRequestDTO {
    @NotBlank(message = "Product ID is required")
    private String productId;
    @NotNull(message = "Min quantity is required")
    @Min(1)
    private Integer minQuantity;
    @NotBlank(message = "Type is required (PERCENT or FIXED)")
    private String type;
    @NotNull(message = "Value is required")
    @DecimalMin(value = "0", message = "Value must be 0 or greater")
    private BigDecimal value;
    private String description;
}
