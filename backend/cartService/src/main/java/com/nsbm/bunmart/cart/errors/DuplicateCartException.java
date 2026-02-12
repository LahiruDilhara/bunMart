package com.nsbm.bunmart.cart.errors;

public class DuplicateCartException extends RuntimeException {
    public DuplicateCartException(String message) {
        super(message);
    }
}
