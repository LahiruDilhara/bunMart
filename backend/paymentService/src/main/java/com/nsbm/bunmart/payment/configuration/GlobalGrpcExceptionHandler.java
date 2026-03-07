package com.nsbm.bunmart.payment.configuration;

import com.nsbm.bunmart.payment.errors.*;
import io.grpc.Status;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.advice.GrpcAdvice;
import net.devh.boot.grpc.server.advice.GrpcExceptionHandler;

@Slf4j
@GrpcAdvice
public class GlobalGrpcExceptionHandler {

    @GrpcExceptionHandler(PaymentNotFoundException.class)
    public Status handlePaymentNotFoundException(PaymentNotFoundException e) {
        log.error(e.getMessage());
        return Status.NOT_FOUND.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(PaymentAlreadyExistsException.class)
    public Status handlePaymentAlreadyExistsException(PaymentAlreadyExistsException e) {
        log.error(e.getMessage());
        return Status.ALREADY_EXISTS.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(InvalidPaymentStateException.class)
    public Status handleInvalidPaymentStateException(InvalidPaymentStateException e) {
        log.error(e.getMessage());
        return Status.FAILED_PRECONDITION.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(PaymentProcessingException.class)
    public Status handlePaymentProcessingException(PaymentProcessingException e) {
        log.error(e.getMessage());
        return Status.INTERNAL.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(IllegalArgumentException.class)
    public Status handleIllegalArgumentException(IllegalArgumentException e) {
        log.error(e.getMessage());
        return Status.INVALID_ARGUMENT.withDescription(e.getMessage() != null ? e.getMessage() : "Invalid argument");
    }

    @GrpcExceptionHandler(NumberFormatException.class)
    public Status handleNumberFormatException(NumberFormatException e) {
        log.error("Invalid number format: {}", e.getMessage());
        return Status.INVALID_ARGUMENT.withDescription("Invalid amount or number format");
    }

    @GrpcExceptionHandler(Exception.class)
    public Status handleGenericException(Exception e) {
        log.error("Unexpected gRPC error: {}", e.getMessage(), e);
        return Status.INTERNAL.withDescription("Internal server error");
    }
}
