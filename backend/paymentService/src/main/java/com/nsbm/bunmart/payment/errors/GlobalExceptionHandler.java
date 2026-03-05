package com.nsbm.bunmart.payment.errors;

import com.nsbm.bunmart.payment.dto.ErrorResponseDTO;
import com.stripe.exception.InvalidRequestException;
import com.stripe.exception.StripeException;
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

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(PaymentNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleNotFound(PaymentNotFoundException e) {
        log.error(e.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponseDTO("The payment does not exist"));
    }

    @ExceptionHandler(PaymentAlreadyExistsException.class)
    public ResponseEntity<ErrorResponseDTO> handleAlreadyExists(PaymentAlreadyExistsException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponseDTO("Payment already exists for this order"));
    }

    @ExceptionHandler(PaymentProcessingException.class)
    public ResponseEntity<ErrorResponseDTO> handleProcessing(PaymentProcessingException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponseDTO("Payment processing failed"));
    }

    @ExceptionHandler(InvalidPaymentStateException.class)
    public ResponseEntity<ErrorResponseDTO> handleInvalidState(InvalidPaymentStateException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponseDTO("Invalid payment state"));
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
        return ResponseEntity.badRequest()
                .body(new ErrorResponseDTO("Invalid request data"));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDTO> handleBadInput(IllegalArgumentException e) {
        log.error(e.getMessage());
        String message = e.getMessage() != null && !e.getMessage().isBlank() ? e.getMessage() : "Invalid request data";
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponseDTO(message));
    }

    @ExceptionHandler(StripeException.class)
    public ResponseEntity<ErrorResponseDTO> handleStripe(StripeException e) {
        log.error(e.getMessage());
        if (e instanceof InvalidRequestException invalid && "amount_too_small".equals(invalid.getStripeError().getCode())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponseDTO("The payment amount is below the minimum required (e.g. 100 LKR or 0.50 USD). Please use a higher amount."));
        }
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(new ErrorResponseDTO("Checkout could not be created"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleAll(Exception e) {
        log.error(e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponseDTO("Service is not available"));
    }
}
