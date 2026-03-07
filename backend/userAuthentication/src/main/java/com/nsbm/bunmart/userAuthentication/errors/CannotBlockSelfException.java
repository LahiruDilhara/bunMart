package com.nsbm.bunmart.userAuthentication.errors;

public class CannotBlockSelfException extends RuntimeException {

    public CannotBlockSelfException(String message) {
        super(message);
    }
}
