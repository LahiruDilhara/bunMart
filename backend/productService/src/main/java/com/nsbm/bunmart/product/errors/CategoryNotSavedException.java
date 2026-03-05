package com.nsbm.bunmart.product.errors;

public class CategoryNotSavedException extends RuntimeException {
    public CategoryNotSavedException(String message) {
        super(message);
    }
}
