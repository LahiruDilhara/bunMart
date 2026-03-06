package com.nsbm.bunmart.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDTO {

    private Long id;
    private String userId;
    private String channel;
    private String templateId;
    private Map<String, String> templateData;
    private String subject;
    private String body;
    private String referenceType;
    private String referenceId;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
