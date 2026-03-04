package com.nsbm.bunmart.cart.configuration;

import com.nsbm.bunmart.cart.errors.CartNotExistsException;
import com.nsbm.bunmart.cart.errors.CartNotSavedException;
import com.nsbm.bunmart.cart.errors.DuplicateCartException;
import com.nsbm.bunmart.cart.errors.DuplicateCartItemException;
import io.grpc.Status;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.advice.GrpcAdvice;
import net.devh.boot.grpc.server.advice.GrpcExceptionHandler;

@Slf4j
@GrpcAdvice
public class GlobalGrpcExceptionHandler {

    @GrpcExceptionHandler(CartNotExistsException.class)
    public Status handleCartNotExistsException(CartNotExistsException e){
        log.error(e.getMessage());
        return Status.NOT_FOUND.withDescription("Cart not found");
    }

    @GrpcExceptionHandler(CartNotSavedException.class)
    public Status handleCartNotSavedException(CartNotSavedException e){
        log.error(e.getMessage());
        return Status.NOT_FOUND.withDescription("Cart not saved");
    }

    @GrpcExceptionHandler(DuplicateCartException.class)
    public Status handleDuplicateCartException(DuplicateCartException e){
        log.error(e.getMessage());
        return Status.RESOURCE_EXHAUSTED.withDescription("Duplicate cart");
    }

    @GrpcExceptionHandler(DuplicateCartItemException.class)
    public Status handleDuplicateCartItemException(DuplicateCartItemException e){
        log.error(e.getMessage());
        return Status.RESOURCE_EXHAUSTED.withDescription("The product already exists");
    }

    @GrpcExceptionHandler(Exception.class)
    public Status handleGenericException(Exception e){
        log.error(e.getMessage());
        return Status.INTERNAL.withDescription("Internal server error");
    }
}
