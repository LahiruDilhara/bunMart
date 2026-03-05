package com.nsbm.bunmart.kitchen.errors;

public class KitchenOrderNotFoundException extends RuntimeException {
    public KitchenOrderNotFoundException(String message) {
        super(message);
    }
}
