package com.nsbm.bunmart.order.dto;

public class PaymentIntentResponseDTO {
    private String paymentIntentId;
    private String clientSecret;
    private String status;

    public PaymentIntentResponseDTO() {
    }

    public PaymentIntentResponseDTO(String paymentIntentId, String clientSecret, String status) {
        this.paymentIntentId = paymentIntentId;
        this.clientSecret = clientSecret;
        this.status = status;
    }

    public String getPaymentIntentId() {
        return paymentIntentId;
    }

    public void setPaymentIntentId(String paymentIntentId) {
        this.paymentIntentId = paymentIntentId;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
