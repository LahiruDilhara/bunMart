package com.nsbm.bunmart.cart.errors;

public class CartNotExists extends RuntimeException {
    public CartNotExists(String message) {
        super(message);
    }
}
