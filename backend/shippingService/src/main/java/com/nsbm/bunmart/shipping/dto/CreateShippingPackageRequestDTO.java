package com.nsbm.bunmart.shipping.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateShippingPackageRequestDTO {
    @NotNull(message = "Weight is required")
    @Positive(message = "Weight must be positive")
    private Double weight;

    @NotBlank(message = "Destination address is required")
    private String destinationAddress;

    @NotBlank(message = "Source address is required")
    private String sourceAddress;

    @NotNull(message = "Total price is required")
    @DecimalMin(value = "0", message = "Total price must be 0 or greater")
    private BigDecimal totalPrice;

    @NotBlank(message = "Order ID is required")
    private String orderId;

    /** User ID for sending delivery notification; optional but recommended. */
    private String userId;

    private Integer driverId;
}
