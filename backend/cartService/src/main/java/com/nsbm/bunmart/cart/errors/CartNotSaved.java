package com.nsbm.bunmart.cart.errors;

public class CartNotSaved extends RuntimeException {
    public CartNotSaved(String message) {
        super(message);
    }
}
