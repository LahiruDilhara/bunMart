package com.nsbm.bunmart.shipping.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDriverRequestDTO {
    @Size(max = 500)
    private String fullName;

    @Min(value = 0, message = "Age must be at least 0")
    private Integer age;

    @Size(max = 50)
    private String phone;

    private Boolean active;

    @Size(max = 200)
    private String vehicle;

    @Min(value = 0, message = "Cargo size must be at least 0")
    private Integer cargoSize;

    @Min(value = 0, message = "Max weight must be at least 0")
    private Double maxWeight;
}
