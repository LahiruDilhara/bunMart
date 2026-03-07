package com.nsbm.bunmart.userAuthentication.services;

import com.nsbm.bunmart.userAuthentication.configuration.JwtUtil;
import com.nsbm.bunmart.userAuthentication.dto.AuthResponseDTO;
import com.nsbm.bunmart.userAuthentication.errors.DuplicateUserException;
import com.nsbm.bunmart.userAuthentication.errors.InvalidCredentialsException;
import com.nsbm.bunmart.userAuthentication.errors.UserBlockedException;
import com.nsbm.bunmart.userAuthentication.model.User;
import com.nsbm.bunmart.userAuthentication.repositories.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponseDTO signUp(String firstName, String lastName, String email,
                                  String password, String phone) {

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateUserException("Email already registered: " + email);
        }

        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setPhone(phone);
        user.setRole("USER");
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        log.info("User registered: {}", saved.getEmail());

        String token = jwtUtil.generateToken(saved.getEmail(), saved.getId(), saved.getRole());

        return new AuthResponseDTO(
                token,
                saved.getId(),
                saved.getFirstName(),
                saved.getLastName(),
                saved.getEmail(),
                saved.getRole(),
                "Sign up successful"
        );
    }

    public AuthResponseDTO signIn(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (user.isBlocked()) {
            throw new UserBlockedException("Account is blocked. Contact support.");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        log.info("User signed in: {}", user.getEmail());

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole());

        return new AuthResponseDTO(
                token,
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                "Sign in successful"
        );
    }
}
