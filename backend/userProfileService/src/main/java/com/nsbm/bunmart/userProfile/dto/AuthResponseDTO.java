package com.nsbm.bunmart.userProfile.dto;

import java.util.List;

public class AuthResponseDTO {

    private String token;
    private String userId;
    private String email;
    private String displayName;
    private List<String> roles;

    public AuthResponseDTO() {
    }

    public AuthResponseDTO(String token, String userId, String email, String displayName, List<String> roles) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.displayName = displayName;
        this.roles = roles;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
}
