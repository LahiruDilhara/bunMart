package com.nsbm.bunmart.order.configuration;

import com.nsbm.bunmart.order.errors.*;
import io.grpc.Status;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.advice.GrpcAdvice;
import net.devh.boot.grpc.server.advice.GrpcExceptionHandler;

@Slf4j
@GrpcAdvice
public class GlobalGrpcExceptionHandler {

    @GrpcExceptionHandler(OrderNotFoundException.class)
    public Status handleOrderNotFound(OrderNotFoundException e) {
        log.error(e.getMessage());
        return Status.NOT_FOUND.withDescription("Order not found");
    }

    @GrpcExceptionHandler(OrderNotSavedException.class)
    public Status handleOrderNotSaved(OrderNotSavedException e) {
        log.error(e.getMessage());
        return Status.INTERNAL.withDescription("Order could not be saved");
    }

    @GrpcExceptionHandler(InvalidOrderStateException.class)
    public Status handleInvalidOrderState(InvalidOrderStateException e) {
        log.error(e.getMessage());
        return Status.FAILED_PRECONDITION.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(Exception.class)
    public Status handleGenericException(Exception e) {
        log.error(e.getMessage());
        return Status.INTERNAL.withDescription("Internal server error");
    }
}
