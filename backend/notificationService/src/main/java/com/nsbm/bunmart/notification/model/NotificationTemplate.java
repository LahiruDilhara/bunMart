package com.nsbm.bunmart.notification.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notification_templates")
public class NotificationTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String channel; // EMAIL, SMS, IN_APP

    private String subject;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String body;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
