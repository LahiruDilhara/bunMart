package com.nsbm.bunmart.kitchen.errors;

public class OrderServiceUnavailableException extends RuntimeException {
    public OrderServiceUnavailableException(String message) {
        super(message);
    }
}
