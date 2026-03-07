package com.nsbm.bunmart.userProfile.services;

import com.nsbm.bunmart.userProfile.dto.AuthResponseDTO;
import com.nsbm.bunmart.userProfile.dto.SignInRequestDTO;
import com.nsbm.bunmart.userProfile.dto.SignUpRequestDTO;
import com.nsbm.bunmart.userProfile.errors.DuplicateUserException;
import com.nsbm.bunmart.userProfile.errors.UserNotFoundException;
import com.nsbm.bunmart.userProfile.model.User;
import com.nsbm.bunmart.userProfile.repositories.UserRepository;
import com.nsbm.bunmart.userProfile.security.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponseDTO signUp(SignUpRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateUserException("User with email " + dto.getEmail() + " already exists");
        }

        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setDisplayName(dto.getDisplayName());
        user.setPhone(dto.getPhone());
        user.setRoles(new ArrayList<>(List.of("CUSTOMER")));
        user.setActive(true);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());

        User savedUser = userRepository.save(user);

        String token = jwtUtil.generateToken(
                String.valueOf(savedUser.getId()),
                savedUser.getEmail(),
                savedUser.getRoles()
        );

        return new AuthResponseDTO(
                token,
                String.valueOf(savedUser.getId()),
                savedUser.getEmail(),
                savedUser.getDisplayName(),
                savedUser.getRoles()
        );
    }

    public AuthResponseDTO signIn(SignInRequestDTO dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Invalid email or password"));

        if (!user.isActive()) {
            throw new UserNotFoundException("Account is deactivated");
        }

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new UserNotFoundException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(
                String.valueOf(user.getId()),
                user.getEmail(),
                user.getRoles()
        );

        return new AuthResponseDTO(
                token,
                String.valueOf(user.getId()),
                user.getEmail(),
                user.getDisplayName(),
                user.getRoles()
        );
    }
}
