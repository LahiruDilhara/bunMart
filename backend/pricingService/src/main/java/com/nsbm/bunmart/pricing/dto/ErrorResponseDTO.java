package com.nsbm.bunmart.pricing.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ErrorResponseDTO {
    private String errorMessage;

    public ErrorResponseDTO(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}
