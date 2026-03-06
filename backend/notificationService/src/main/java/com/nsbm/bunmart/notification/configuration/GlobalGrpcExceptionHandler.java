package com.nsbm.bunmart.notification.configuration;

import com.nsbm.bunmart.notification.errors.NotificationNotFoundException;
import com.nsbm.bunmart.notification.errors.NotificationSendFailedException;
import com.nsbm.bunmart.notification.errors.RuleNotFoundException;
import com.nsbm.bunmart.notification.errors.TemplateNotFoundException;
import io.grpc.Status;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.advice.GrpcAdvice;
import net.devh.boot.grpc.server.advice.GrpcExceptionHandler;

@Slf4j
@GrpcAdvice
public class GlobalGrpcExceptionHandler {

    @GrpcExceptionHandler(NotificationNotFoundException.class)
    public Status handleNotificationNotFound(NotificationNotFoundException e) {
        log.error(e.getMessage());
        return Status.NOT_FOUND.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(TemplateNotFoundException.class)
    public Status handleTemplateNotFound(TemplateNotFoundException e) {
        log.error(e.getMessage());
        return Status.NOT_FOUND.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(RuleNotFoundException.class)
    public Status handleRuleNotFound(RuleNotFoundException e) {
        log.error(e.getMessage());
        return Status.NOT_FOUND.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(NotificationSendFailedException.class)
    public Status handleSendFailed(NotificationSendFailedException e) {
        log.error(e.getMessage());
        return Status.INTERNAL.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(Exception.class)
    public Status handleGenericException(Exception e) {
        log.error("Unexpected gRPC error: {}", e.getMessage());
        return Status.INTERNAL.withDescription("Internal server error");
    }
}
