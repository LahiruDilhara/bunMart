package com.nsbm.bunmart.kitchen.configuration;

import io.grpc.Status;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.advice.GrpcAdvice;
import net.devh.boot.grpc.server.advice.GrpcExceptionHandler;
import jakarta.persistence.EntityNotFoundException;

@Slf4j
@GrpcAdvice
public class GlobalGrpcExceptionHandler {

    // Handle specific "Not Found" cases (e.g., Recipe or Order missing)
    @GrpcExceptionHandler(EntityNotFoundException.class)
    public Status handleResourceNotFound(EntityNotFoundException e) {
        log.warn("Resource not found: {}", e.getMessage());
        return Status.NOT_FOUND
                .withDescription(e.getMessage())
                .withCause(e);
    }

    // Handle business logic violations (e.g., trying to cook an already canceled order)
    @GrpcExceptionHandler(IllegalStateException.class)
    public Status handleIllegalState(IllegalStateException e) {
        log.warn("Business logic violation: {}", e.getMessage());
        return Status.FAILED_PRECONDITION
                .withDescription(e.getMessage())
                .withCause(e);
    }

    // Handle Validation/Argument errors
    @GrpcExceptionHandler(IllegalArgumentException.class)
    public Status handleInvalidArgument(IllegalArgumentException e) {
        log.warn("Invalid argument received: {}", e.getMessage());
        return Status.INVALID_ARGUMENT
                .withDescription(e.getMessage())
                .withCause(e);
    }

    //Fallback for everything else
    @GrpcExceptionHandler(Exception.class)
    public Status handleGenericException(Exception e){
        log.error(e.getMessage());
        return Status.INTERNAL.withDescription("Internal server error");
    }
}
