package com.nsbm.bunmart.payment.dto;

public class ArchivePaymentResponseDTO {

    private String message;
    private String paymentId;

    public ArchivePaymentResponseDTO() {
    }

    public ArchivePaymentResponseDTO(String message, String paymentId) {
        this.message = message;
        this.paymentId = paymentId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }
}
