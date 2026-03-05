package com.nsbm.bunmart.shipping.errors;

public class ShippingPackageNotSavedException extends RuntimeException {
    public ShippingPackageNotSavedException(String message) {
        super(message);
    }
}
