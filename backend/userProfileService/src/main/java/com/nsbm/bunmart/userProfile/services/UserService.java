package com.nsbm.bunmart.userProfile.services;

import com.nsbm.bunmart.userProfile.dto.CreateAddressRequestDTO;
import com.nsbm.bunmart.userProfile.dto.CreateUserRequestDTO;
import com.nsbm.bunmart.userProfile.dto.UpdateAddressRequestDTO;
import com.nsbm.bunmart.userProfile.dto.UpdateUserRequestDTO;
import com.nsbm.bunmart.userProfile.errors.AddressNotFoundException;
import com.nsbm.bunmart.userProfile.errors.DuplicateUserException;
import com.nsbm.bunmart.userProfile.errors.UserNotFoundException;
import com.nsbm.bunmart.userProfile.errors.UserNotSavedException;
import com.nsbm.bunmart.userProfile.model.Address;
import com.nsbm.bunmart.userProfile.model.User;
import com.nsbm.bunmart.userProfile.repositories.AddressRepository;
import com.nsbm.bunmart.userProfile.repositories.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    public UserService(UserRepository userRepository, AddressRepository addressRepository) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
    }

    // ==================== USER CRUD ====================

    public User createUser(CreateUserRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateUserException("User with email " + dto.getEmail() + " already exists");
        }

        User user = new User();
        user.setEmail(dto.getEmail());
        user.setDisplayName(dto.getDisplayName());
        user.setPhone(dto.getPhone());
        user.setRoles(dto.getRoles() != null ? dto.getRoles() : new ArrayList<>());
        user.setActive(true);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());

        try {
            return userRepository.save(user);
        } catch (Exception e) {
            log.error("Failed to save user: {}", e.getMessage());
            throw new UserNotSavedException("Failed to save user");
        }
    }

    public User getUserById(String userId) {
        Integer id = parseId(userId);
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found for id: " + userId));
    }

    public User updateUser(String userId, UpdateUserRequestDTO dto) {
        User user = getUserById(userId);

        if (dto.getEmail() != null) {
            user.setEmail(dto.getEmail());
        }
        if (dto.getDisplayName() != null) {
            user.setDisplayName(dto.getDisplayName());
        }
        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone());
        }
        if (dto.getRoles() != null) {
            user.setRoles(dto.getRoles());
        }
        user.setUpdatedAt(Instant.now());

        try {
            return userRepository.save(user);
        } catch (Exception e) {
            log.error("Failed to update user: {}", e.getMessage());
            throw new UserNotSavedException("Failed to update user");
        }
    }

    public void deleteUser(String userId) {
        User user = getUserById(userId);
        addressRepository.deleteByUserId(user.getId());
        userRepository.delete(user);
    }

    // ==================== ADDRESS CRUD ====================

    public Address createAddress(String userId, CreateAddressRequestDTO dto) {
        User user = getUserById(userId);

        Address address = new Address();
        address.setUserId(user.getId());
        address.setLine1(dto.getLine1());
        address.setLine2(dto.getLine2());
        address.setCity(dto.getCity());
        address.setState(dto.getState());
        address.setPostalCode(dto.getPostalCode());
        address.setCountry(dto.getCountry());
        address.setType(dto.getType());
        address.setCreatedAt(Instant.now());
        address.setUpdatedAt(Instant.now());

        try {
            return addressRepository.save(address);
        } catch (Exception e) {
            log.error("Failed to save address: {}", e.getMessage());
            throw new UserNotSavedException("Failed to save address");
        }
    }

    public List<Address> getUserAddresses(String userId) {
        User user = getUserById(userId);
        return addressRepository.findByUserId(user.getId());
    }

    public Address getAddressById(String userId, String addressId) {
        User user = getUserById(userId);
        Integer addrId = parseId(addressId);

        Address address = addressRepository.findById(addrId)
                .orElseThrow(() -> new AddressNotFoundException("Address not found for id: " + addressId));

        if (!address.getUserId().equals(user.getId())) {
            throw new AddressNotFoundException("Address does not belong to user: " + userId);
        }
        return address;
    }

    public Address updateAddress(String userId, String addressId, UpdateAddressRequestDTO dto) {
        Address address = getAddressById(userId, addressId);

        if (dto.getLine1() != null) {
            address.setLine1(dto.getLine1());
        }
        if (dto.getLine2() != null) {
            address.setLine2(dto.getLine2());
        }
        if (dto.getCity() != null) {
            address.setCity(dto.getCity());
        }
        if (dto.getState() != null) {
            address.setState(dto.getState());
        }
        if (dto.getPostalCode() != null) {
            address.setPostalCode(dto.getPostalCode());
        }
        if (dto.getCountry() != null) {
            address.setCountry(dto.getCountry());
        }
        if (dto.getType() != null) {
            address.setType(dto.getType());
        }
        address.setUpdatedAt(Instant.now());

        try {
            return addressRepository.save(address);
        } catch (Exception e) {
            log.error("Failed to update address: {}", e.getMessage());
            throw new UserNotSavedException("Failed to update address");
        }
    }

    public void deleteAddress(String userId, String addressId) {
        Address address = getAddressById(userId, addressId);
        addressRepository.delete(address);
    }

    // ==================== VALIDATION (used by gRPC) ====================

    public boolean isUserValid(String userId) {
        Integer id = parseId(userId);
        return userRepository.findById(id)
                .map(User::isActive)
                .orElse(false);
    }

    // ==================== HELPER ====================

    private Integer parseId(String id) {
        try {
            return Integer.parseInt(id);
        } catch (NumberFormatException e) {
            throw new UserNotFoundException("Invalid id format: " + id);
        }
    }
}
