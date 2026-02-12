package com.nsbm.bunmart.cart.configuration;

import com.nsbm.bunmart.cart.dto.ErrorResponseDTO;
import com.nsbm.bunmart.cart.errors.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalRestExceptionHandler {

    @ExceptionHandler(CartItemNotExistsException.class)
    public ResponseEntity<ErrorResponseDTO> handleCartItemNotExists(CartItemNotExistsException e){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponseDTO("The cart item does not exist"));
    }

    @ExceptionHandler(CartNotExistsException.class)
    public ResponseEntity<ErrorResponseDTO> handleCartNotExists(CartNotExistsException e){
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponseDTO("The cart does not exist"));
    }

    @ExceptionHandler(CartNotSavedException.class)
    public ResponseEntity<ErrorResponseDTO> handleCartNotSavedException(CartNotSavedException e){
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseDTO("Cart saving failed"));
    }

    @ExceptionHandler(DuplicateCartException.class)
    public ResponseEntity<ErrorResponseDTO> handleDuplicateCartException(DuplicateCartException e){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponseDTO("Single user should only have a single cart"));
    }

    @ExceptionHandler(DuplicateCartItemException.class)
    public ResponseEntity<ErrorResponseDTO> handleDuplicateCartItemException(DuplicateCartItemException e){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponseDTO("Cannot put same product twice"));
    }

    @ExceptionHandler(OrderServiceUnavailableException.class)
    public ResponseEntity<ErrorResponseDTO> handleOrderServiceUnavailable(OrderServiceUnavailableException e){
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseDTO("Order placements are not available"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGeneric(Exception e){
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseDTO("Service is not available"));
    }

}
