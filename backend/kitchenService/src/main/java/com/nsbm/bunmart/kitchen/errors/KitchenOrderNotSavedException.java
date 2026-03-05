package com.nsbm.bunmart.kitchen.errors;

public class KitchenOrderNotSavedException extends RuntimeException {
    public KitchenOrderNotSavedException(String message) {
        super(message);
    }
}
