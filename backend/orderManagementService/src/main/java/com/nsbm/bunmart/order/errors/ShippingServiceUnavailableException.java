package com.nsbm.bunmart.order.errors;

public class ShippingServiceUnavailableException extends RuntimeException {
    public ShippingServiceUnavailableException(String message) {
        super(message);
    }
}
