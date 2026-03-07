package com.nsbm.bunmart.userProfile.dto;

import java.time.Instant;
import java.util.List;

/**
 * Profile response matching frontend UserProfile (get-or-create by userId).
 */
public class ProfileResponseDTO {

    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String role;
    private List<ProfileAddressDTO> addresses;
    private Instant createdAt;
    private Instant updatedAt;

    public ProfileResponseDTO() {
    }

    public ProfileResponseDTO(String id, String firstName, String lastName, String email, String phone,
                              String role, List<ProfileAddressDTO> addresses, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.addresses = addresses;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public List<ProfileAddressDTO> getAddresses() { return addresses; }
    public void setAddresses(List<ProfileAddressDTO> addresses) { this.addresses = addresses; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
