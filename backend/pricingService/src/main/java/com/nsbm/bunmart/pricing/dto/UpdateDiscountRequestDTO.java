package com.nsbm.bunmart.pricing.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDiscountRequestDTO {
    private String productId;
    private Integer minQuantity;
    private String type;
    private BigDecimal value;
    private String description;
    private Boolean isActive;
}
