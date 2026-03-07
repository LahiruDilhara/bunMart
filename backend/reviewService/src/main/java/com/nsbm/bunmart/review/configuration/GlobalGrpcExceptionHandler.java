package com.nsbm.bunmart.review.configuration;

import com.nsbm.bunmart.review.errors.ReviewNotFoundException;
import io.grpc.Status;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.advice.GrpcAdvice;
import net.devh.boot.grpc.server.advice.GrpcExceptionHandler;

@Slf4j
@GrpcAdvice
public class GlobalGrpcExceptionHandler {

    @GrpcExceptionHandler(ReviewNotFoundException.class)
    public Status handleReviewNotFoundException(ReviewNotFoundException e) {
        log.error(e.getMessage());
        return Status.NOT_FOUND.withDescription(e.getMessage());
    }

    @GrpcExceptionHandler(NumberFormatException.class)
    public Status handleNumberFormatException(NumberFormatException e) {
        log.error("Invalid format: {}", e.getMessage());
        return Status.INVALID_ARGUMENT.withDescription("Invalid page_token or number format");
    }

    @GrpcExceptionHandler(Exception.class)
    public Status handleGenericException(Exception e) {
        log.error("Unexpected gRPC error: {}", e.getMessage(), e);
        return Status.INTERNAL.withDescription("Internal server error");
    }
}
