package com.nsbm.bunmart.userAuthentication.services;

import com.nsbm.bunmart.userAuthentication.errors.AddressNotFoundException;
import com.nsbm.bunmart.userAuthentication.errors.CannotBlockSelfException;
import com.nsbm.bunmart.userAuthentication.errors.UserNotFoundException;
import com.nsbm.bunmart.userAuthentication.model.Address;
import com.nsbm.bunmart.userAuthentication.model.User;
import com.nsbm.bunmart.userAuthentication.repositories.AddressRepository;
import com.nsbm.bunmart.userAuthentication.repositories.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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

    // ==================== User Profile ====================

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + email));
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + id));
    }

    public User updateUser(String email, String firstName, String lastName, String phone) {
        User user = getUserByEmail(email);
        if (firstName != null) user.setFirstName(firstName);
        if (lastName != null) user.setLastName(lastName);
        if (phone != null) user.setPhone(phone);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public void deleteUser(String email) {
        User user = getUserByEmail(email);
        userRepository.delete(user);
        log.info("User deleted: {}", email);
    }

    // ==================== Address ====================

    public Address addAddress(String email, String type, String street, String city,
                              String state, String postalCode, String country) {
        User user = getUserByEmail(email);

        Address address = new Address();
        address.setType(type);
        address.setStreet(street);
        address.setCity(city);
        address.setState(state);
        address.setPostalCode(postalCode);
        address.setCountry(country);
        address.setUser(user);
        address.setCreatedAt(LocalDateTime.now());
        address.setUpdatedAt(LocalDateTime.now());

        return addressRepository.save(address);
    }

    public List<Address> getAddresses(String email) {
        User user = getUserByEmail(email);
        return addressRepository.findByUserId(user.getId());
    }

    public List<Address> getAddressesByUserId(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    public Address updateAddress(Long addressId, String email, String type, String street, String city,
                                 String state, String postalCode, String country) {
        User user = getUserByEmail(email);
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new AddressNotFoundException("Address not found: " + addressId));
        if (!address.getUser().getId().equals(user.getId())) {
            throw new AddressNotFoundException("Address not found: " + addressId);
        }
        if (type != null) address.setType(type);
        if (street != null) address.setStreet(street);
        if (city != null) address.setCity(city);
        if (state != null) address.setState(state);
        if (postalCode != null) address.setPostalCode(postalCode);
        if (country != null) address.setCountry(country);
        address.setUpdatedAt(LocalDateTime.now());

        return addressRepository.save(address);
    }

    public void deleteAddress(Long addressId, String email) {
        User user = getUserByEmail(email);
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new AddressNotFoundException("Address not found: " + addressId));
        if (!address.getUser().getId().equals(user.getId())) {
            throw new AddressNotFoundException("Address not found: " + addressId);
        }
        addressRepository.deleteById(addressId);
    }

    // ==================== Admin (user list, block/unblock, stats) ====================

    public Page<User> getUsersPage(Pageable pageable, String search) {
        if (search != null && !search.isBlank()) {
            return userRepository.findByEmailContainingIgnoreCase(search.trim(), pageable);
        }
        return userRepository.findAll(pageable);
    }

    public User setBlocked(Long userId, boolean blocked, Long currentUserId) {
        if (userId.equals(currentUserId)) {
            throw new CannotBlockSelfException("You cannot block or unblock yourself");
        }
        User user = getUserById(userId);
        user.setBlocked(blocked);
        user.setUpdatedAt(LocalDateTime.now());
        User saved = userRepository.save(user);
        log.info("User {} {} by admin", user.getEmail(), blocked ? "blocked" : "unblocked");
        return saved;
    }

    public long getTotalUserCount() {
        return userRepository.count();
    }

    public long getBlockedUserCount() {
        return userRepository.countByBlocked(true);
    }
}