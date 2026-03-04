package com.nsbm.bunmart.kitchen.errors;

public class DatabaseExceptionException extends RuntimeException {
    public DatabaseExceptionException(String message) {
        super(message);
    }
}
