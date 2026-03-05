package com.nsbm.bunmart.pricing.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductPricesRequestDTO {
    @NotEmpty(message = "Product IDs list is required")
    private List<String> productIds;
}
