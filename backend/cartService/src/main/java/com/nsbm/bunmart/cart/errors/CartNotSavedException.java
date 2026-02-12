package com.nsbm.bunmart.cart.errors;

public class CartNotSavedException extends RuntimeException {
    public CartNotSavedException(String message) {
        super(message);
    }
}
