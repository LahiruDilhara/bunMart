package com.nsbm.bunmart.pricing.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true, length = 36)
    private String userId;

    @Column(name = "user_segment", length = 50)
    private String userSegment;

    @Column(name = "loyalty_tier", length = 20)
    private String loyaltyTier;

    @Column(name = "total_spent", precision = 10, scale = 2)
    private java.math.BigDecimal totalSpent;

    @Column(name = "order_count")
    private Integer orderCount;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (orderCount == null) orderCount = 0;
        if (totalSpent == null) totalSpent = java.math.BigDecimal.ZERO;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}