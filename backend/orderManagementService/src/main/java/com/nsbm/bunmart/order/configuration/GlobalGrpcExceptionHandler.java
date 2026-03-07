package com.nsbm.bunmart.order.configuration;

import com.nsbm.bunmart.order.errors.InvalidOrderStateException;
import com.nsbm.bunmart.order.errors.OrderNotFoundException;
import com.nsbm.bunmart.order.errors.OrderNotSavedException;
import io.grpc.Status;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.advice.GrpcAdvice;
import net.devh.boot.grpc.server.advice.GrpcExceptionHandler;

@Slf4j
@GrpcAdvice
public class GlobalGrpcExceptionHandler {

    @GrpcExceptionHandler(OrderNotFoundException.class)
    public Status handleOrderNotFoundException(OrderNotFoundException e) {
        log.error(e.getMessage());
        return Status.NOT_FOUND.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(OrderNotSavedException.class)
    public Status handleOrderNotSavedException(OrderNotSavedException e) {
        log.error(e.getMessage());
        return Status.INTERNAL.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(InvalidOrderStateException.class)
    public Status handleInvalidOrderStateException(InvalidOrderStateException e) {
        log.error(e.getMessage());
        return Status.FAILED_PRECONDITION.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(Exception.class)
    public Status handleGenericException(Exception e) {
        log.error("Unexpected gRPC error: {}", e.getMessage(), e);
        return Status.INTERNAL.withDescription("Internal server error");
    }
}
