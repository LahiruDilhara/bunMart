package com.nsbm.bunmart.userProfile.controller;

import com.nsbm.bunmart.userProfile.dto.*;
import com.nsbm.bunmart.userProfile.mappers.rest.UserRestMapper;
import com.nsbm.bunmart.userProfile.model.Address;
import com.nsbm.bunmart.userProfile.model.User;
import com.nsbm.bunmart.userProfile.services.UserService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;
    private final UserRestMapper userRestMapper;

    public UserController(UserService userService, UserRestMapper userRestMapper) {
        this.userService = userService;
        this.userRestMapper = userRestMapper;
    }

    // ==================== USER ENDPOINTS ====================

    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody CreateUserRequestDTO dto) {
        User user = userService.createUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(userRestMapper.userToUserResponseDTO(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUser(@PathVariable String id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(userRestMapper.userToUserResponseDTO(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable String id, @Valid @RequestBody UpdateUserRequestDTO dto) {
        User user = userService.updateUser(id, dto);
        return ResponseEntity.ok(userRestMapper.userToUserResponseDTO(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== ADDRESS ENDPOINTS ====================

    @PostMapping("/{id}/addresses")
    public ResponseEntity<AddressResponseDTO> createAddress(@PathVariable String id, @Valid @RequestBody CreateAddressRequestDTO dto) {
        Address address = userService.createAddress(id, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(userRestMapper.addressToAddressResponseDTO(address));
    }

    @GetMapping("/{id}/addresses")
    public ResponseEntity<List<AddressResponseDTO>> getUserAddresses(@PathVariable String id) {
        List<Address> addresses = userService.getUserAddresses(id);
        List<AddressResponseDTO> responseDTOs = addresses.stream()
                .map(userRestMapper::addressToAddressResponseDTO)
                .toList();
        return ResponseEntity.ok(responseDTOs);
    }

    @PutMapping("/{id}/addresses/{addrId}")
    public ResponseEntity<AddressResponseDTO> updateAddress(@PathVariable String id, @PathVariable String addrId, @RequestBody UpdateAddressRequestDTO dto) {
        Address address = userService.updateAddress(id, addrId, dto);
        return ResponseEntity.ok(userRestMapper.addressToAddressResponseDTO(address));
    }

    @DeleteMapping("/{id}/addresses/{addrId}")
    public ResponseEntity<Void> deleteAddress(@PathVariable String id, @PathVariable String addrId) {
        userService.deleteAddress(id, addrId);
        return ResponseEntity.noContent().build();
    }
}