package com.nsbm.bunmart.order.errors;

public class PricingServiceUnavailableException extends RuntimeException {
    public PricingServiceUnavailableException(String message) {
        super(message);
    }
}
