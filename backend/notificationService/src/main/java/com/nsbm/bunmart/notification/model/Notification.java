package com.nsbm.bunmart.notification.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String channel; // EMAIL, SMS, IN_APP

    private String templateId;

    @ElementCollection
    @CollectionTable(name = "notification_template_data", joinColumns = @JoinColumn(name = "notification_id"))
    @MapKeyColumn(name = "data_key")
    @Column(name = "data_value")
    private Map<String, String> templateData = new HashMap<>();

    private String subject;

    @Column(columnDefinition = "TEXT")
    private String body;

    private String referenceType; // ORDER, PAYMENT, SHIPMENT

    private String referenceId;

    @Column(nullable = false)
    private String status; // SENT, QUEUED, FAILED

    /** For IN_APP: whether the user has read this notification. */
    @Column(nullable = false, columnDefinition = "boolean not null default false")
    private boolean read = false;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
