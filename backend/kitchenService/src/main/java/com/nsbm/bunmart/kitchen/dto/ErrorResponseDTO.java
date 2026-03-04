package com.nsbm.bunmart.kitchen.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ErrorResponseDTO {
    String errorMessage;

    public ErrorResponseDTO(String errorMessage) {
        this.errorMessage = errorMessage;
    }

}
