package com.nsbm.bunmart.order.errors;

public class OrderNotSavedException extends RuntimeException {
    public OrderNotSavedException(String message) {
        super(message);
    }
}
