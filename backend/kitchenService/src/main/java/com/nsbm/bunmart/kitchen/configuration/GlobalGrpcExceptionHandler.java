package com.nsbm.bunmart.kitchen.configuration;

import com.nsbm.bunmart.kitchen.errors.DuplicateOrderIdException;
import com.nsbm.bunmart.kitchen.errors.KitchenOrderLineNotFoundException;
import com.nsbm.bunmart.kitchen.errors.KitchenOrderNotFoundException;
import com.nsbm.bunmart.kitchen.errors.KitchenOrderNotSavedException;
import com.nsbm.bunmart.kitchen.errors.LinesNotDoneException;
import io.grpc.Status;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.advice.GrpcAdvice;
import net.devh.boot.grpc.server.advice.GrpcExceptionHandler;

@Slf4j
@GrpcAdvice
public class GlobalGrpcExceptionHandler {

    @GrpcExceptionHandler(KitchenOrderNotFoundException.class)
    public Status handleKitchenOrderNotFoundException(KitchenOrderNotFoundException e) {
        log.error(e.getMessage());
        return Status.NOT_FOUND.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(KitchenOrderLineNotFoundException.class)
    public Status handleKitchenOrderLineNotFoundException(KitchenOrderLineNotFoundException e) {
        log.error(e.getMessage());
        return Status.NOT_FOUND.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(KitchenOrderNotSavedException.class)
    public Status handleKitchenOrderNotSavedException(KitchenOrderNotSavedException e) {
        log.error(e.getMessage());
        return Status.INTERNAL.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(DuplicateOrderIdException.class)
    public Status handleDuplicateOrderIdException(DuplicateOrderIdException e) {
        log.error(e.getMessage());
        return Status.ALREADY_EXISTS.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(LinesNotDoneException.class)
    public Status handleLinesNotDoneException(LinesNotDoneException e) {
        log.warn(e.getMessage());
        return Status.INVALID_ARGUMENT.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(Exception.class)
    public Status handleGenericException(Exception e) {
        log.error(e.getMessage(), e);
        return Status.INTERNAL.withDescription("Internal server error");
    }
}
