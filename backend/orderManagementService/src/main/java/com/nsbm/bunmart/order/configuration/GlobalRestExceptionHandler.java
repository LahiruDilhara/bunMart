package com.nsbm.bunmart.order.configuration;

import com.nsbm.bunmart.order.dto.ErrorResponseDTO;
import com.nsbm.bunmart.order.errors.*;
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

    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleOrderNotFound(OrderNotFoundException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponseDTO("Order not found"));
    }

    @ExceptionHandler(OrderNotSavedException.class)
    public ResponseEntity<ErrorResponseDTO> handleOrderNotSaved(OrderNotSavedException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponseDTO("Order could not be saved"));
    }

    @ExceptionHandler(InvalidOrderStateException.class)
    public ResponseEntity<ErrorResponseDTO> handleInvalidOrderState(InvalidOrderStateException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponseDTO(e.getMessage()));
    }

    @ExceptionHandler(PricingServiceUnavailableException.class)
    public ResponseEntity<ErrorResponseDTO> handlePricingUnavailable(PricingServiceUnavailableException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ErrorResponseDTO("Pricing service is unavailable"));
    }

    @ExceptionHandler(PaymentServiceUnavailableException.class)
    public ResponseEntity<ErrorResponseDTO> handlePaymentUnavailable(PaymentServiceUnavailableException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ErrorResponseDTO("Payment service is unavailable"));
    }

    @ExceptionHandler(KitchenServiceUnavailableException.class)
    public ResponseEntity<ErrorResponseDTO> handleKitchenUnavailable(KitchenServiceUnavailableException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ErrorResponseDTO("Kitchen service is unavailable"));
    }

    @ExceptionHandler(ShippingServiceUnavailableException.class)
    public ResponseEntity<ErrorResponseDTO> handleShippingUnavailable(ShippingServiceUnavailableException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ErrorResponseDTO("Shipping service is unavailable"));
    }

    @ExceptionHandler(CartServiceUnavailableException.class)
    public ResponseEntity<ErrorResponseDTO> handleCartUnavailable(CartServiceUnavailableException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ErrorResponseDTO("Cart service is unavailable"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGeneric(Exception e) {
        log.error("Internal Server Error: {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponseDTO("Internal server error. Please check logs."));
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
        return ResponseEntity.badRequest()
                .body(new ErrorResponseDTO("Invalid request data"));
    }
}
