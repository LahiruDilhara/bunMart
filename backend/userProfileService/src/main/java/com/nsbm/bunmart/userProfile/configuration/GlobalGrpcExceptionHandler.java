package com.nsbm.bunmart.userProfile.configuration;

import com.nsbm.bunmart.userProfile.errors.AddressNotFoundException;
import com.nsbm.bunmart.userProfile.errors.DuplicateUserException;
import com.nsbm.bunmart.userProfile.errors.UserNotFoundException;
import com.nsbm.bunmart.userProfile.errors.UserNotSavedException;
import io.grpc.Status;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.advice.GrpcAdvice;
import net.devh.boot.grpc.server.advice.GrpcExceptionHandler;

@Slf4j
@GrpcAdvice
public class GlobalGrpcExceptionHandler {

    @GrpcExceptionHandler(UserNotFoundException.class)
    public Status handleUserNotFoundException(UserNotFoundException e) {
        log.error(e.getMessage());
        return Status.NOT_FOUND.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(AddressNotFoundException.class)
    public Status handleAddressNotFoundException(AddressNotFoundException e) {
        log.error(e.getMessage());
        return Status.NOT_FOUND.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(DuplicateUserException.class)
    public Status handleDuplicateUserException(DuplicateUserException e) {
        log.error(e.getMessage());
        return Status.ALREADY_EXISTS.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(UserNotSavedException.class)
    public Status handleUserNotSavedException(UserNotSavedException e) {
        log.error(e.getMessage());
        return Status.INTERNAL.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(NumberFormatException.class)
    public Status handleNumberFormatException(NumberFormatException e) {
        log.error("Invalid user id format: {}", e.getMessage());
        return Status.INVALID_ARGUMENT.withDescription("Invalid user_id format");
    }

    @GrpcExceptionHandler(Exception.class)
    public Status handleGenericException(Exception e) {
        log.error("Unexpected gRPC error: {}", e.getMessage(), e);
        return Status.INTERNAL.withDescription("Internal server error");
    }
}
