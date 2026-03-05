package com.nsbm.bunmart.payment.errors;

// thrown when payment processing fails (e.g. gateway unavailable)
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
