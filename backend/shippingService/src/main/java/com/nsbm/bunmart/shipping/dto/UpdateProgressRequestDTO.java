package com.nsbm.bunmart.shipping.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProgressRequestDTO {
    @NotNull(message = "Progress is required")
    @Min(0)
    @Max(100)
    private Integer progress;
}
