package com.nsbm.bunmart.cart.errors;

public class DuplicateCartItem extends RuntimeException {
    public DuplicateCartItem(String message) {
        super(message);
    }
}
