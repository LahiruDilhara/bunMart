package com.nsbm.bunmart.product.errors;

public class DatabaseExceptionException extends RuntimeException {
    public DatabaseExceptionException(String message) {
        super(message);
    }
}
