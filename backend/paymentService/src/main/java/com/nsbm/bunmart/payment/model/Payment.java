package com.nsbm.bunmart.payment.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

// this class maps directly to the payments table in sql server
// jpa reads the annotations and creates the table automatically
@Entity
@Table(name = "payments")
@Data
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "payment_id")
    private String paymentId;

    // which order this payment belongs to
    @Column(name = "order_id", nullable = false)
    private String orderId;

    // who is making the payment
    @Column(name = "user_id", nullable = false)
    private String userId;

    // always use BigDecimal for money - NEVER float or double
    // float has rounding errors: 19.99 might become 19.989999999
    @Column(name = "amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name = "currency_code", nullable = false)
    private String currencyCode;

    // shown on payment page like Order #12345
    @Column(name = "order_name")
    private String orderName;

    // stripe gives us this id when we create a payment intent
    // looks like: pi_3QxxxxxxxxxxxxxxxxxxxxxxX
    // we use this to match payment when stripe webhook fires
    @Column(name = "stripe_payment_intent_id")
    private String stripePaymentIntentId;

    // stripe also gives us this secret
    // frontend uses it with stripe.js to show the card form
    @Column(name = "client_secret", length = 500)
    private String clientSecret;

    // payment goes through these states:
    // PENDING -> SUCCESS (user paid)
    // PENDING -> FAILED  (card declined or expired)
    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // jpa calls this automatically before first save
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = PaymentStatus.PENDING;
    }

    // jpa calls this automatically before every update
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum PaymentStatus {
        PENDING,   // waiting for user to complete payment
        SUCCESS,   // stripe confirmed money received
        FAILED,    // card declined, expired, or user gave up
        REFUNDED   // money sent back to user
    }
}