package com.nsbm.bunmart.userAuthentication.configuration;

import com.nsbm.bunmart.userAuthentication.errors.UserNotFoundException;
import io.grpc.Status;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.advice.GrpcAdvice;
import net.devh.boot.grpc.server.advice.GrpcExceptionHandler;

@Slf4j
@GrpcAdvice
public class GlobalGrpcExceptionHandler {

    @GrpcExceptionHandler(UserNotFoundException.class)
    public Status handleUserNotFound(UserNotFoundException e) {
        log.error(e.getMessage());
        return Status.NOT_FOUND.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(Exception.class)
    public Status handleGenericException(Exception e) {
        log.error("Unexpected gRPC error: {}", e.getMessage());
        return Status.INTERNAL.withDescription("Internal server error");
    }
}
