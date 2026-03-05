package com.nsbm.bunmart.kitchen.errors;

public class DuplicateOrderIdException extends RuntimeException {
    public DuplicateOrderIdException(String message) {
        super(message);
    }
}
