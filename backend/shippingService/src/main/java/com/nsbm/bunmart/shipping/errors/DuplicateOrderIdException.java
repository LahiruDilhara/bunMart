package com.nsbm.bunmart.shipping.errors;

public class DuplicateOrderIdException extends RuntimeException {
    public DuplicateOrderIdException(String message) {
        super(message);
    }
}
