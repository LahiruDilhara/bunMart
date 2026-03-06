package com.nsbm.bunmart.notification.errors;

public class NotificationSendFailedException extends RuntimeException {
    public NotificationSendFailedException(String message) {
        super(message);
    }
}
