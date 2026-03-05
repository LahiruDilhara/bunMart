package com.nsbm.bunmart.kitchen.errors;

public class KitchenOrderLineNotFoundException extends RuntimeException {
    public KitchenOrderLineNotFoundException(String message) {
        super(message);
    }
}
