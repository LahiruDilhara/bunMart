package com.nsbm.bunmart.product.errors;

public class ProductNotSavedException extends RuntimeException {
    public ProductNotSavedException(String message) {
        super(message);
    }
}
