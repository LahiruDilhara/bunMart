package com.nsbm.bunmart.cart.configuration;

import com.nsbm.bunmart.cart.errors.CartNotExistsException;
import com.nsbm.bunmart.cart.errors.CartNotSavedException;
import com.nsbm.bunmart.cart.errors.DuplicateCartException;
import io.grpc.Status;
import net.devh.boot.grpc.server.advice.GrpcAdvice;
import net.devh.boot.grpc.server.advice.GrpcExceptionHandler;

@GrpcAdvice
public class GlobalGrpcExceptionHandler {

    @GrpcExceptionHandler(CartNotExistsException.class)
    public Status handleCartNotExistsException(CartNotExistsException e){
        return Status.NOT_FOUND.withDescription("Cart not found");
    }

    @GrpcExceptionHandler(CartNotSavedException.class)
    public Status handleCartNotSavedException(CartNotSavedException e){
        return Status.NOT_FOUND.withDescription("Cart not saved");
    }

    @GrpcExceptionHandler(DuplicateCartException.class)
    public Status handleDuplicateCartException(DuplicateCartException e){
        return Status.RESOURCE_EXHAUSTED.withDescription("Duplicate cart");
    }

    @GrpcExceptionHandler(Exception.class)
    public Status handleGenericException(Exception e){
        return Status.INTERNAL.withDescription("Internal server error");
    }
}
