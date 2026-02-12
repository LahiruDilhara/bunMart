package com.nsbm.bunmart.cart.errors;

public class DatabaseExceptionException extends RuntimeException {
    public DatabaseExceptionException(String message) {
        super(message);
    }
}
