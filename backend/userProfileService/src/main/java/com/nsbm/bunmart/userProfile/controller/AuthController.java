package com.nsbm.bunmart.userProfile.controller;

import com.nsbm.bunmart.userProfile.dto.*;
import com.nsbm.bunmart.userProfile.mappers.rest.UserRestMapper;
import com.nsbm.bunmart.userProfile.model.User;
import com.nsbm.bunmart.userProfile.services.AuthService;
import com.nsbm.bunmart.userProfile.services.UserService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final UserRestMapper userRestMapper;

    public AuthController(AuthService authService, UserService userService, UserRestMapper userRestMapper) {
        this.authService = authService;
        this.userService = userService;
        this.userRestMapper = userRestMapper;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponseDTO> signUp(@Valid @RequestBody SignUpRequestDTO dto) {
        AuthResponseDTO response = authService.signUp(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponseDTO> signIn(@Valid @RequestBody SignInRequestDTO dto) {
        AuthResponseDTO response = authService.signIn(dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        // JWT is stateless — client just discards the token
        // This endpoint exists so frontend has a clear logout action
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getCurrentUser(Authentication authentication) {
        String userId = authentication.getName();
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(userRestMapper.userToUserResponseDTO(user));
    }
}
