package com.nsbm.bunmart.kitchen.dto;

import com.nsbm.bunmart.kitchen.model.KitchenStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStatusRequestDTO {

    @NotNull(message = "Status cannot be null")
    private KitchenStatus status;

    private String notes;
}