package com.nsbm.bunmart.order.errors;

public class CartServiceUnavailableException extends RuntimeException {
    public CartServiceUnavailableException(String message) {
        super(message);
    }
}
