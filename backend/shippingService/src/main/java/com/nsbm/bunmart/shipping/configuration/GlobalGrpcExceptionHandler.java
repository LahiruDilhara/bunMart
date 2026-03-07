package com.nsbm.bunmart.shipping.configuration;

import com.nsbm.bunmart.shipping.errors.*;
import io.grpc.Status;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.advice.GrpcAdvice;
import net.devh.boot.grpc.server.advice.GrpcExceptionHandler;

@Slf4j
@GrpcAdvice
public class GlobalGrpcExceptionHandler {

    @GrpcExceptionHandler(ShippingPackageNotFoundException.class)
    public Status handleShippingPackageNotFoundException(ShippingPackageNotFoundException e) {
        log.error(e.getMessage());
        return Status.NOT_FOUND.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(DriverNotFoundException.class)
    public Status handleDriverNotFoundException(DriverNotFoundException e) {
        log.error(e.getMessage());
        return Status.NOT_FOUND.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(ShippingPackageNotSavedException.class)
    public Status handleShippingPackageNotSavedException(ShippingPackageNotSavedException e) {
        log.error(e.getMessage());
        return Status.INTERNAL.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(DuplicateOrderIdException.class)
    public Status handleDuplicateOrderIdException(DuplicateOrderIdException e) {
        log.error(e.getMessage());
        return Status.ALREADY_EXISTS.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(NumberFormatException.class)
    public Status handleNumberFormatException(NumberFormatException e) {
        log.error("Invalid format: {}", e.getMessage());
        return Status.INVALID_ARGUMENT.withDescription("Invalid number format");
    }

    @GrpcExceptionHandler(IllegalArgumentException.class)
    public Status handleIllegalArgumentException(IllegalArgumentException e) {
        log.error(e.getMessage());
        return Status.INVALID_ARGUMENT.withDescription(e.getMessage() != null ? e.getMessage() : "Invalid argument");
    }

    @GrpcExceptionHandler(Exception.class)
    public Status handleGenericException(Exception e) {
        log.error("Unexpected gRPC error: {}", e.getMessage(), e);
        return Status.INTERNAL.withDescription("Internal server error");
    }
}
