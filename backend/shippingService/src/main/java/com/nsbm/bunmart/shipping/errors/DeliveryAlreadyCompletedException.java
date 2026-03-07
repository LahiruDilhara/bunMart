package com.nsbm.bunmart.shipping.errors;

/**
 * Thrown when the admin tries to change the driver on a shipping package that is already delivered.
 */
public class DeliveryAlreadyCompletedException extends RuntimeException {
    public DeliveryAlreadyCompletedException(String message) {
        super(message);
    }
}
