package com.nsbm.bunmart.cart.errors;

public class CartItemNotExists extends RuntimeException {
    public CartItemNotExists(String message) {
        super(message);
    }
}
