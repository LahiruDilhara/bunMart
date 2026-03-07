package com.nsbm.bunmart.product.configuration;

import com.nsbm.bunmart.product.errors.*;
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

    @GrpcExceptionHandler(CategoryNotFoundException.class)
    public Status handleCategoryNotFoundException(CategoryNotFoundException e) {
        log.error(e.getMessage());
        return Status.NOT_FOUND.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(ProductNotSavedException.class)
    public Status handleProductNotSavedException(ProductNotSavedException e) {
        log.error(e.getMessage());
        return Status.INTERNAL.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(CategoryNotSavedException.class)
    public Status handleCategoryNotSavedException(CategoryNotSavedException e) {
        log.error(e.getMessage());
        return Status.INTERNAL.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(DuplicateProductException.class)
    public Status handleDuplicateProductException(DuplicateProductException e) {
        log.error(e.getMessage());
        return Status.ALREADY_EXISTS.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(DuplicateCategoryException.class)
    public Status handleDuplicateCategoryException(DuplicateCategoryException e) {
        log.error(e.getMessage());
        return Status.ALREADY_EXISTS.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(CategoryInUseException.class)
    public Status handleCategoryInUseException(CategoryInUseException e) {
        log.error(e.getMessage());
        return Status.FAILED_PRECONDITION.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(DatabaseExceptionException.class)
    public Status handleDatabaseException(DatabaseExceptionException e) {
        log.error(e.getMessage());
        return Status.INVALID_ARGUMENT.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(InvalidImageException.class)
    public Status handleInvalidImageException(InvalidImageException e) {
        log.error(e.getMessage());
        return Status.INVALID_ARGUMENT.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(Exception.class)
    public Status handleGenericException(Exception e) {
        log.error("Unexpected gRPC error: {}", e.getMessage(), e);
        return Status.INTERNAL.withDescription("Internal server error");
    }
}
