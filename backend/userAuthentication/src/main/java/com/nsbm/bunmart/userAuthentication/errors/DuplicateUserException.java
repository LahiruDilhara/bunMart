package com.nsbm.bunmart.userAuthentication.errors;

public class DuplicateUserException extends RuntimeException {
    public DuplicateUserException(String message) {
        super(message);
    }
}
