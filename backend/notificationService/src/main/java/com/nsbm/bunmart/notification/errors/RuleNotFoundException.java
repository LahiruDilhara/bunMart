package com.nsbm.bunmart.notification.errors;

public class RuleNotFoundException extends RuntimeException {
    public RuleNotFoundException(String message) {
        super(message);
    }
}
