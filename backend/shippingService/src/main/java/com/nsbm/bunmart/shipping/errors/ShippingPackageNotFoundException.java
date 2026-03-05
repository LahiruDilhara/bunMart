package com.nsbm.bunmart.shipping.errors;

public class ShippingPackageNotFoundException extends RuntimeException {
    public ShippingPackageNotFoundException(String message) {
        super(message);
    }
}
