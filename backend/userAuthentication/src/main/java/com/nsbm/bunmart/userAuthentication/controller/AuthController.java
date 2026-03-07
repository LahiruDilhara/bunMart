package com.nsbm.bunmart.userAuthentication.controller;

import com.nsbm.bunmart.userAuthentication.dto.AuthResponseDTO;
import com.nsbm.bunmart.userAuthentication.dto.MessageResponseDTO;
import com.nsbm.bunmart.userAuthentication.dto.SignInRequestDTO;
import com.nsbm.bunmart.userAuthentication.dto.SignUpRequestDTO;
import com.nsbm.bunmart.userAuthentication.services.AuthService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponseDTO> signUp(@Valid @RequestBody SignUpRequestDTO request) {
        AuthResponseDTO response = authService.signUp(
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                request.getPassword(),
                request.getPhone()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponseDTO> signIn(@Valid @RequestBody SignInRequestDTO request) {
        AuthResponseDTO response = authService.signIn(
                request.getEmail(),
                request.getPassword()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponseDTO> logout() {
        // JWT is stateless - logout is handled on the frontend by removing the token
        // This endpoint just confirms the logout action
        return ResponseEntity.ok(new MessageResponseDTO("Logout successful. Please remove the token from client."));
    }
}
