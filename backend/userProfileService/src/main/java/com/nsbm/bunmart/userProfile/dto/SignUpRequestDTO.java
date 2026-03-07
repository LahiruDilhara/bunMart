package com.nsbm.bunmart.userProfile.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SignUpRequestDTO {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Display name is required")
    private String displayName;

    private String phone;

    public SignUpRequestDTO() {
    }

    public SignUpRequestDTO(String email, String password, String displayName, String phone) {
        this.email = email;
        this.password = password;
        this.displayName = displayName;
        this.phone = phone;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
