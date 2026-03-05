package com.nsbm.bunmart.order.dto;

public class PaymentIdRequestDTO {

    /** Payment ID from payment service; may be null to clear. */
    private String paymentId;

    public PaymentIdRequestDTO() {
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }
}
