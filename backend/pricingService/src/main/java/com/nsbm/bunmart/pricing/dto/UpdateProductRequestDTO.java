package com.nsbm.bunmart.pricing.dto;

import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductRequestDTO {
    private String name;
    private BigDecimal rawPrice;
    private BigDecimal tax;
    private BigDecimal shippingCost;
    private String currencyCode;
    private Boolean isActive;
}
