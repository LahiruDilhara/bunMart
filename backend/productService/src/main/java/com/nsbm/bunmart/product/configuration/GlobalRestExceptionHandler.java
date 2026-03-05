package com.nsbm.bunmart.product.configuration;

import com.nsbm.bunmart.product.dto.ErrorResponseDTO;
import com.nsbm.bunmart.product.errors.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;

@Slf4j
@RestControllerAdvice
public class GlobalRestExceptionHandler {

    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleProductNotFound(ProductNotFoundException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponseDTO(e.getMessage()));
    }

    @ExceptionHandler(CategoryNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleCategoryNotFound(CategoryNotFoundException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponseDTO(e.getMessage()));
    }

    @ExceptionHandler(ProductNotSavedException.class)
    public ResponseEntity<ErrorResponseDTO> handleProductNotSaved(ProductNotSavedException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseDTO("Product could not be saved"));
    }

    @ExceptionHandler(CategoryNotSavedException.class)
    public ResponseEntity<ErrorResponseDTO> handleCategoryNotSaved(CategoryNotSavedException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseDTO("Category could not be saved"));
    }

    @ExceptionHandler(DuplicateCategoryException.class)
    public ResponseEntity<ErrorResponseDTO> handleDuplicateCategory(DuplicateCategoryException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponseDTO(e.getMessage()));
    }

    @ExceptionHandler(DuplicateProductException.class)
    public ResponseEntity<ErrorResponseDTO> handleDuplicateProduct(DuplicateProductException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponseDTO(e.getMessage()));
    }

    @ExceptionHandler(CategoryInUseException.class)
    public ResponseEntity<ErrorResponseDTO> handleCategoryInUse(CategoryInUseException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponseDTO(e.getMessage()));
    }

    @ExceptionHandler(DatabaseExceptionException.class)
    public ResponseEntity<ErrorResponseDTO> handleDatabaseException(DatabaseExceptionException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponseDTO("Invalid data"));
    }

    @ExceptionHandler(InvalidImageException.class)
    public ResponseEntity<ErrorResponseDTO> handleInvalidImage(InvalidImageException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponseDTO(e.getMessage()));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponseDTO> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(new ErrorResponseDTO("Image file too large"));
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<ErrorResponseDTO> handleMultipartException(MultipartException e) {
        log.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponseDTO("Invalid multipart request"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGeneric(Exception e) {
        log.error(e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseDTO("Service is not available"));
    }
}
