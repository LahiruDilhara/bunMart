package com.nsbm.bunmart.kitchen.configuration;

import com.nsbm.bunmart.kitchen.errors.ImageNotFoundException;
import com.nsbm.bunmart.kitchen.errors.OrderServiceUnavailableException;
import com.nsbm.bunmart.kitchen.errors.ProductionOrderNotFoundException;
import com.nsbm.bunmart.kitchen.errors.ProductionOrderNotSavedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalRestExceptionHandler {

    @ExceptionHandler(ProductionOrderNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(ProductionOrderNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(ImageNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleImageNotFound(ImageNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(ProductionOrderNotSavedException.class)
    public ResponseEntity<Map<String, String>> handleNotSaved(ProductionOrderNotSavedException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(OrderServiceUnavailableException.class)
    public ResponseEntity<Map<String, String>> handleOrderUnavailable(OrderServiceUnavailableException e) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneric(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
    }
}
