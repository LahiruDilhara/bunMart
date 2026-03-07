package com.nsbm.bunmart.shipping.configuration;

import com.nsbm.bunmart.shipping.dto.ErrorResponseDTO;
import com.nsbm.bunmart.shipping.errors.*;
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

    @ExceptionHandler(DriverNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleDriverNotFound(DriverNotFoundException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponseDTO("Driver not found"));
    }

    @ExceptionHandler(ShippingPackageNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleShippingPackageNotFound(ShippingPackageNotFoundException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponseDTO("Shipping package not found"));
    }

    @ExceptionHandler(ShippingPackageNotSavedException.class)
    public ResponseEntity<ErrorResponseDTO> handleNotSaved(ShippingPackageNotSavedException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseDTO("Shipping package operation failed"));
    }

    @ExceptionHandler(DuplicateOrderIdException.class)
    public ResponseEntity<ErrorResponseDTO> handleDuplicateOrderId(DuplicateOrderIdException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponseDTO(e.getMessage()));
    }

    @ExceptionHandler(DeliveryAlreadyCompletedException.class)
    public ResponseEntity<ErrorResponseDTO> handleDeliveryAlreadyCompleted(DeliveryAlreadyCompletedException e) {
        log.warn(e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponseDTO(e.getMessage()));
    }

    @ExceptionHandler({
            MethodArgumentNotValidException.class,
            ConstraintViolationException.class,
            MissingServletRequestParameterException.class,
            MethodArgumentTypeMismatchException.class,
            HttpMessageNotReadableException.class
    })
    public ResponseEntity<ErrorResponseDTO> handleBadRequest(Exception ex) {
        log.error(ex.getMessage(), ex);
        return ResponseEntity.badRequest().body(new ErrorResponseDTO("Invalid request data"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGeneric(Exception e) {
        log.error(e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseDTO("Service is not available"));
    }
}
