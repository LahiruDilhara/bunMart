package com.nsbm.bunmart.shipping.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateDriverRequestDTO {
    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotNull(message = "Age is required")
    @Min(value = 0, message = "Age must be at least 0")
    private Integer age;

    private String phone;
    private String vehicle;

    @Min(value = 0, message = "Cargo size must be at least 0")
    private Integer cargoSize;

    @Min(value = 0, message = "Max weight must be at least 0")
    private Double maxWeight;
}
