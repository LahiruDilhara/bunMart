package com.nsbm.bunmart.kitchen.configuration;

import com.nsbm.bunmart.kitchen.errors.ImageNotFoundException;
import com.nsbm.bunmart.kitchen.errors.OrderServiceUnavailableException;
import com.nsbm.bunmart.kitchen.errors.ProductionOrderNotFoundException;
import com.nsbm.bunmart.kitchen.errors.ProductionOrderNotSavedException;
import io.grpc.Status;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.advice.GrpcAdvice;
import net.devh.boot.grpc.server.advice.GrpcExceptionHandler;

@Slf4j
@GrpcAdvice
public class GlobalGrpcExceptionHandler {

    @GrpcExceptionHandler(ProductionOrderNotFoundException.class)
    public Status handleNotFound(ProductionOrderNotFoundException e) {
        log.error(e.getMessage());
        return Status.NOT_FOUND.withDescription("Production order not found");
    }

    @GrpcExceptionHandler(ProductionOrderNotSavedException.class)
    public Status handleNotSaved(ProductionOrderNotSavedException e) {
        log.error(e.getMessage());
        return Status.INTERNAL.withDescription("Failed to save production order");
    }

    @GrpcExceptionHandler(ImageNotFoundException.class)
    public Status handleImageNotFound(ImageNotFoundException e) {
        log.error(e.getMessage());
        return Status.NOT_FOUND.withDescription("Image not found");
    }

    @GrpcExceptionHandler(OrderServiceUnavailableException.class)
    public Status handleOrderUnavailable(OrderServiceUnavailableException e) {
        log.error(e.getMessage());
        return Status.UNAVAILABLE.withDescription("Order service unavailable");
    }

    @GrpcExceptionHandler(Exception.class)
    public Status handleGenericException(Exception e) {
        log.error(e.getMessage());
        return Status.INTERNAL.withDescription("Internal server error");
    }
}
