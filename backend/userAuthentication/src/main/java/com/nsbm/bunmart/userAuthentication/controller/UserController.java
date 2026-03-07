package com.nsbm.bunmart.userAuthentication.controller;

import com.nsbm.bunmart.userAuthentication.dto.*;
import com.nsbm.bunmart.userAuthentication.mappers.rest.UserMapper;
import com.nsbm.bunmart.userAuthentication.model.Address;
import com.nsbm.bunmart.userAuthentication.model.User;
import com.nsbm.bunmart.userAuthentication.services.UserService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    public UserController(UserService userService, UserMapper userMapper) {
        this.userService = userService;
        this.userMapper = userMapper;
    }

    // ==================== Profile ====================

    /**
     * Get profile by authenticated user (JWT) or by userId query param (for frontend calling with stored userId).
     * When userId is present, returns that user's profile (permitted without JWT). Otherwise requires authentication.
     */
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponseDTO> getProfile(
            @RequestParam(required = false) Long userId,
            Authentication authentication) {
        if (userId != null) {
            User user = userService.getUserById(userId);
            List<Address> addresses = userService.getAddressesByUserId(userId);
            return ResponseEntity.ok(userMapper.toUserProfileResponseDTO(user, addresses));
        }
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        List<Address> addresses = userService.getAddressesByUserId(user.getId());
        return ResponseEntity.ok(userMapper.toUserProfileResponseDTO(user, addresses));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponseDTO> updateProfile(Authentication authentication,
                                                                @RequestBody UpdateUserRequestDTO request) {
        String email = authentication.getName();
        User updated = userService.updateUser(email, request.getFirstName(),
                request.getLastName(), request.getPhone());
        return ResponseEntity.ok(userMapper.toUserProfileResponseDTO(updated));
    }

    @DeleteMapping("/profile")
    public ResponseEntity<MessageResponseDTO> deleteProfile(Authentication authentication) {
        String email = authentication.getName();
        userService.deleteUser(email);
        return ResponseEntity.ok(new MessageResponseDTO("Account deleted successfully"));
    }

    // ==================== Addresses ====================

    /**
     * Add a new address for the authenticated user.
     * Request body: type (DELIVERY/BILLING), street, city, state (optional), postalCode, country.
     */
    @PostMapping("/addresses")
    public ResponseEntity<AddressResponseDTO> addAddress(Authentication authentication,
                                                         @Valid @RequestBody AddressRequestDTO request) {
        String email = authentication.getName();
        Address address = userService.addAddress(email, request.getType(), request.getStreet(),
                request.getCity(), request.getState(), request.getPostalCode(), request.getCountry());
        return ResponseEntity.status(HttpStatus.CREATED).body(userMapper.toAddressResponseDTO(address));
    }

    /**
     * Get all addresses for the authenticated user.
     */
    @GetMapping("/addresses")
    public ResponseEntity<List<AddressResponseDTO>> getAddresses(Authentication authentication) {
        String email = authentication.getName();
        List<AddressResponseDTO> addresses = userService.getAddresses(email)
                .stream()
                .map(userMapper::toAddressResponseDTO)
                .toList();
        return ResponseEntity.ok(addresses);
    }

    /**
     * Update an existing address. Only the owner can update. Returns 404 if not found or not owned.
     */
    @PutMapping("/addresses/{id}")
    public ResponseEntity<AddressResponseDTO> updateAddress(Authentication authentication,
                                                            @PathVariable Long id,
                                                            @Valid @RequestBody AddressRequestDTO request) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = authentication.getName();
        Address updated = userService.updateAddress(id, email, request.getType(), request.getStreet(),
                request.getCity(), request.getState(), request.getPostalCode(), request.getCountry());
        return ResponseEntity.ok(userMapper.toAddressResponseDTO(updated));
    }

    /**
     * Delete an address. Only the owner can delete. Returns 404 if not found or not owned.
     */
    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<Void> deleteAddress(Authentication authentication, @PathVariable Long id) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = authentication.getName();
        userService.deleteAddress(id, email);
        return ResponseEntity.noContent().build();
    }

    // ==================== Admin (list users, stats, block/unblock) ====================

    @GetMapping("/list")
    public ResponseEntity<Page<UserListItemDTO>> listUsers(
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage = userService.getUsersPage(pageable, search);
        Page<UserListItemDTO> dtoPage = userPage.map(userMapper::toUserListItemDTO);
        return ResponseEntity.ok(dtoPage);
    }

    @GetMapping("/stats")
    public ResponseEntity<UserStatsResponseDTO> getUserStats() {
        long total = userService.getTotalUserCount();
        long blocked = userService.getBlockedUserCount();
        return ResponseEntity.ok(new UserStatsResponseDTO(total, blocked));
    }

    @PatchMapping("/{id}/blocked")
    public ResponseEntity<UserListItemDTO> setUserBlocked(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody SetBlockedRequestDTO request) {
        String email = authentication.getName();
        User currentUser = userService.getUserByEmail(email);
        User updated = userService.setBlocked(id, request.isBlocked(), currentUser.getId());
        return ResponseEntity.ok(userMapper.toUserListItemDTO(updated));
    }
}
