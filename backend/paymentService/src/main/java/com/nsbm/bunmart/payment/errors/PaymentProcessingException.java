package com.nsbm.bunmart.payment.errors;

// thrown when stripe api call fails
public class PaymentProcessingException extends RuntimeException {
    private final String orderId;
    private final String reason;

    public PaymentProcessingException(String orderId, String reason) {
        super("Payment processing failed for order: " + orderId + " reason: " + reason);
        this.orderId = orderId;
        this.reason = reason;
    }

    public String getOrderId() { return orderId; }
    public String getReason() { return reason; }
}
