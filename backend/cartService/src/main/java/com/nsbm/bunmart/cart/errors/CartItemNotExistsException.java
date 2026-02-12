package com.nsbm.bunmart.cart.errors;

public class CartItemNotExistsException extends RuntimeException {
    public CartItemNotExistsException(String message) {
        super(message);
    }
}
