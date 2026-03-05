package com.nsbm.bunmart.pricing.errors;

public class DuplicateProductIdException extends RuntimeException {
    public DuplicateProductIdException(String message) {
        super(message);
    }
}
