package com.nsbm.bunmart.kitchen.errors;

/**
 * Thrown when the kitchen order cannot be set to COMPLETED because not all lines have status DONE.
 */
public class LinesNotDoneException extends RuntimeException {
    public LinesNotDoneException(String message) {
        super(message);
    }
}
