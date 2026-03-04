package com.nsbm.bunmart.payment.errors;

// thrown when order already has a successful payment
// prevents double charging the same order
public class PaymentAlreadyExistsException extends RuntimeException {
    private final String orderId;

    public PaymentAlreadyExistsException(String orderId) {
        super("Payment already exists for order: " + orderId);
        this.orderId = orderId;
    }

    public String getOrderId() { return orderId; }
}
