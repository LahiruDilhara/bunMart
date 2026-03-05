package com.nsbm.bunmart.payment.dto;

public class ErrorResponseDTO {
    private String errorMessage;

    public ErrorResponseDTO(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}
