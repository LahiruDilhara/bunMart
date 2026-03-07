package com.nsbm.bunmart.userAuthentication.errors;

public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}
