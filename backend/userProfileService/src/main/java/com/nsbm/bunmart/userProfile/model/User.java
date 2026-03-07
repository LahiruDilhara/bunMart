package com.nsbm.bunmart.userProfile.model;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false)
    private String email;

    /** Auth service user id; used for get-or-create profile by userId. */
    @Column(unique = true, name = "auth_user_id")
    private String authUserId;

    @Column(nullable = false)
    private String password;

    private String displayName;

    private String phone;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private List<String> roles = new ArrayList<>();

    private boolean active = true;

    private Instant createdAt;

    private Instant updatedAt;

    public User() {
    }

    public User(Integer id, String email, String password, String displayName, String phone, List<String> roles, boolean active, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.displayName = displayName;
        this.phone = phone;
        this.roles = roles != null ? roles : new ArrayList<>();
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getAuthUserId() { return authUserId; }
    public void setAuthUserId(String authUserId) { this.authUserId = authUserId; }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
