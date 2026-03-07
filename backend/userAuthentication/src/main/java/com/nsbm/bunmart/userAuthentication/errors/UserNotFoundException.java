package com.nsbm.bunmart.userAuthentication.errors;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }
}
