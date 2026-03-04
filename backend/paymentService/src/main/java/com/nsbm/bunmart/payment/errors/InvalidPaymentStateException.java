package com.nsbm.bunmart.payment.errors;

import com.nsbm.bunmart.payment.model.Payment;

// thrown when trying to do something invalid with payment state
// example: trying to confirm a payment that already failed
public class InvalidPaymentStateException extends RuntimeException {
    private final Payment.PaymentStatus currentStatus;
    private final Payment.PaymentStatus expectedStatus;

    public InvalidPaymentStateException(Payment.PaymentStatus current, Payment.PaymentStatus expected) {
        super("Invalid state. Current: " + current + " Expected: " + expected);
        this.currentStatus = current;
        this.expectedStatus = expected;
    }

    public Payment.PaymentStatus getCurrentStatus() { return currentStatus; }
    public Payment.PaymentStatus getExpectedStatus() { return expectedStatus; }
}
