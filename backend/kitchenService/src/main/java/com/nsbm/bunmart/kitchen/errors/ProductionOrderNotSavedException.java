package com.nsbm.bunmart.kitchen.errors;

public class ProductionOrderNotSavedException extends RuntimeException {
    public ProductionOrderNotSavedException(String message) {
        super(message);
    }
}
