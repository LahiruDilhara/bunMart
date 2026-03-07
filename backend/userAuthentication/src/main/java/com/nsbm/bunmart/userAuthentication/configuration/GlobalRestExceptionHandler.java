package com.nsbm.bunmart.userAuthentication.configuration;

import com.nsbm.bunmart.userAuthentication.errors.AddressNotFoundException;
import com.nsbm.bunmart.userAuthentication.errors.CannotBlockSelfException;
import com.nsbm.bunmart.userAuthentication.errors.DuplicateUserException;
import com.nsbm.bunmart.userAuthentication.errors.InvalidCredentialsException;
import com.nsbm.bunmart.userAuthentication.errors.UserBlockedException;
import com.nsbm.bunmart.userAuthentication.errors.UserNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalRestExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleUserNotFound(UserNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(DuplicateUserException.class)
    public ResponseEntity<Map<String, String>> handleDuplicateUser(DuplicateUserException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleInvalidCredentials(InvalidCredentialsException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(UserBlockedException.class)
    public ResponseEntity<Map<String, String>> handleUserBlocked(UserBlockedException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(CannotBlockSelfException.class)
    public ResponseEntity<Map<String, String>> handleCannotBlockSelf(CannotBlockSelfException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(AddressNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleAddressNotFound(AddressNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneric(Exception e) {
        e.printStackTrace();  // <-- add this line to see error in console
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));  // <-- change this to show real message
    }
}
