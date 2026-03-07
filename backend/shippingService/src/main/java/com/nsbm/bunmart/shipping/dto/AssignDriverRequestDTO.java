package com.nsbm.bunmart.shipping.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignDriverRequestDTO {
    @NotNull(message = "Driver ID is required")
    private Integer driverId;
}
