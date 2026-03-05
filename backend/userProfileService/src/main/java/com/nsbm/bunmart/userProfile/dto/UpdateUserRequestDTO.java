package com.nsbm.bunmart.userProfile.dto;

import jakarta.validation.constraints.Email;

import java.util.List;

public class UpdateUserRequestDTO {

    @Email(message = "Email must be valid")
    private String email;

    private String displayName;

    private String phone;

    private List<String> roles;

    public UpdateUserRequestDTO() {
    }

    public UpdateUserRequestDTO(String email, String displayName, String phone, List<String> roles) {
        this.email = email;
        this.displayName = displayName;
        this.phone = phone;
        this.roles = roles;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
}
