package com.nsbm.bunmart.cart.errors;

public class CartNotExistsException extends RuntimeException {
    public CartNotExistsException(String message) {
        super(message);
    }
}
