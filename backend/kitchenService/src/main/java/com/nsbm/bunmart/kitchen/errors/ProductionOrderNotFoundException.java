package com.nsbm.bunmart.kitchen.errors;

public class ProductionOrderNotFoundException extends RuntimeException {
    public ProductionOrderNotFoundException(String message) {
        super(message);
    }
}
