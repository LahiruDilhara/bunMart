package com.nsbm.bunmart.payment.errors;

import com.stripe.exception.CardException;
import com.stripe.exception.StripeException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

// @RestControllerAdvice intercepts all exceptions thrown from any REST controller
// instead of showing a java stack trace to the user we return clean json responses
// each @ExceptionHandler method handles one specific exception type
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // payment not found - this happens when someone passes a wrong id
    @ExceptionHandler(PaymentNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(PaymentNotFoundException e) {
        log.warn("payment not found -> {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                        "error",     "PAYMENT_NOT_FOUND",
                        "message",   e.getMessage(),
                        "timestamp", LocalDateTime.now().toString()
                ));
    }

    // duplicate payment - order already paid successfully so we block second attempt
    @ExceptionHandler(PaymentAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleAlreadyExists(PaymentAlreadyExistsException e) {
        log.warn("duplicate payment -> orderId={}", e.getOrderId());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "error",     "PAYMENT_ALREADY_EXISTS",
                "message",   e.getMessage(),
                "orderId",   e.getOrderId(),
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    // stripe api call failed - could be wrong key, network issue or stripe is down
    @ExceptionHandler(PaymentProcessingException.class)
    public ResponseEntity<Map<String, Object>> handleProcessing(PaymentProcessingException e) {
        log.error("payment processing failed -> {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(Map.of(
                "error",     "PAYMENT_PROCESSING_FAILED",
                "message",   e.getMessage(),
                "orderId",   e.getOrderId(),
                "reason",    e.getReason(),
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    // invalid state transition - like trying to confirm a payment that already failed
    @ExceptionHandler(InvalidPaymentStateException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidState(InvalidPaymentStateException e) {
        log.warn("invalid payment state -> {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "error",         "INVALID_PAYMENT_STATE",
                "message",       e.getMessage(),
                "currentStatus", e.getCurrentStatus().name(),
                "timestamp",     LocalDateTime.now().toString()
        ));
    }

    // card was declined by stripe - 402 means payment required but failed
    // common reasons: insufficient funds, expired card, wrong cvv
    @ExceptionHandler(CardException.class)
    public ResponseEntity<Map<String, Object>> handleCard(CardException e) {
        log.warn("card declined -> code={}", e.getCode());
        return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(Map.of(
                "error",     "CARD_DECLINED",
                "message",   "Your card was declined: " + e.getMessage(),
                "code",      e.getCode() != null ? e.getCode() : "unknown",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    // stripe itself is down or we sent wrong api key - 502 bad gateway
    // we return 502 because the problem is with the external service not us
    @ExceptionHandler(StripeException.class)
    public ResponseEntity<Map<String, Object>> handleStripe(StripeException e) {
        log.error("stripe api error -> {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of(
                "error",     "PAYMENT_GATEWAY_ERROR",
                "message",   "Payment gateway error. Please try again.",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    // validation failed - request body fields failed @Valid checks
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> fieldErrors = new HashMap<>();
        e.getBindingResult().getFieldErrors().forEach(err ->
                fieldErrors.put(err.getField(), err.getDefaultMessage()));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "error",       "VALIDATION_FAILED",
                "fieldErrors", fieldErrors,
                "timestamp",   LocalDateTime.now().toString()
        ));
    }

    // bad input from caller - null ids, empty strings, wrong formats
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleBadInput(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "error",     "INVALID_REQUEST",
                "message",   e.getMessage(),
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    // last safety net - catches anything we did not specifically handle above
    // we never want a raw java exception reaching the frontend
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAll(Exception e) {
        log.error("unexpected error -> {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error",     "INTERNAL_SERVER_ERROR",
                "message",   "Something went wrong. Please try again.",
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}