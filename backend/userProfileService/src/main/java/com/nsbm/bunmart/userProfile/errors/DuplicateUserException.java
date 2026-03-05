package com.nsbm.bunmart.userProfile.errors;

public class DuplicateUserException extends RuntimeException {
    public DuplicateUserException(String message) {
        super(message);
    }
}
