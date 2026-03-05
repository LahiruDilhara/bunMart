package com.nsbm.bunmart.kitchen.configuration;

import com.nsbm.bunmart.kitchen.dto.ErrorResponseDTO;
import com.nsbm.bunmart.kitchen.errors.*;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@Slf4j
@RestControllerAdvice
public class GlobalRestExceptionHandler {

    @ExceptionHandler(KitchenOrderNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleKitchenOrderNotFound(KitchenOrderNotFoundException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponseDTO("The kitchen order does not exist"));
    }

    @ExceptionHandler(KitchenOrderLineNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleLineNotFound(KitchenOrderLineNotFoundException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponseDTO("The kitchen order line does not exist"));
    }

    @ExceptionHandler(KitchenOrderNotSavedException.class)
    public ResponseEntity<ErrorResponseDTO> handleNotSaved(KitchenOrderNotSavedException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseDTO("Kitchen order save failed"));
    }

    @ExceptionHandler(DuplicateOrderIdException.class)
    public ResponseEntity<ErrorResponseDTO> handleDuplicateOrderId(DuplicateOrderIdException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponseDTO(e.getMessage()));
    }

    @ExceptionHandler(OrderServiceUnavailableException.class)
    public ResponseEntity<ErrorResponseDTO> handleOrderUnavailable(OrderServiceUnavailableException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseDTO("Order service is not available"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGeneric(Exception e) {
        log.error(e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseDTO("Service is not available"));
    }

    @ExceptionHandler({
            MethodArgumentNotValidException.class,
            ConstraintViolationException.class,
            MissingServletRequestParameterException.class,
            MethodArgumentTypeMismatchException.class,
            HttpMessageNotReadableException.class
    })
    public ResponseEntity<ErrorResponseDTO> handleBadRequestExceptions(Exception ex) {
        log.error(ex.getMessage(), ex);
        return ResponseEntity.badRequest().body(new ErrorResponseDTO("Invalid request data"));
    }
}
