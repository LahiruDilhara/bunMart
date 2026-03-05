package com.nsbm.bunmart.pricing.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCouponRequestDTO {
    @NotBlank(message = "Code is required")
    private String code;
    private String productId;
    private Integer minQuantity;
    @NotBlank(message = "Type is required (PERCENT or FIXED)")
    private String type;
    @NotNull(message = "Value is required")
    @DecimalMin(value = "0", message = "Value must be 0 or greater")
    private BigDecimal value;
    private String description;
    private BigDecimal minOrderAmount;
    private Integer usageLimit;
    private LocalDateTime expiresAt;
}
