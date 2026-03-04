package com.nsbm.bunmart.payment.errors;

// thrown when we look up a payment that does not exist in the database
public class PaymentNotFoundException extends RuntimeException {

    private final String paymentId;

    public PaymentNotFoundException(String paymentId) {
        super("Payment not found with id: " + paymentId);
        this.paymentId = paymentId;
    }

    // second constructor for when searching by other fields like orderId
    public PaymentNotFoundException(String field, String value) {
        super("Payment not found with " + field + ": " + value);
        this.paymentId = value;
    }

    public String getPaymentId() { return paymentId; }
}