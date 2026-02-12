package com.nsbm.bunmart.cart.errors;

public class DuplicateCart extends RuntimeException {
    public DuplicateCart(String message) {
        super(message);
    }
}
