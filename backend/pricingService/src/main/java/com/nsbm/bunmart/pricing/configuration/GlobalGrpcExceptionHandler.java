package com.nsbm.bunmart.pricing.configuration;

import com.nsbm.bunmart.pricing.errors.*;
import io.grpc.Status;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.advice.GrpcAdvice;
import net.devh.boot.grpc.server.advice.GrpcExceptionHandler;

@Slf4j
@GrpcAdvice
public class GlobalGrpcExceptionHandler {

    @GrpcExceptionHandler(ProductNotFoundException.class)
    public Status handleProductNotFoundException(ProductNotFoundException e) {
        log.error(e.getMessage());
        return Status.NOT_FOUND.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(CouponNotFoundException.class)
    public Status handleCouponNotFoundException(CouponNotFoundException e) {
        log.error(e.getMessage());
        return Status.NOT_FOUND.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(DiscountNotFoundException.class)
    public Status handleDiscountNotFoundException(DiscountNotFoundException e) {
        log.error(e.getMessage());
        return Status.NOT_FOUND.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(DuplicateProductIdException.class)
    public Status handleDuplicateProductIdException(DuplicateProductIdException e) {
        log.error(e.getMessage());
        return Status.ALREADY_EXISTS.withDescription(e.getMessage());
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
