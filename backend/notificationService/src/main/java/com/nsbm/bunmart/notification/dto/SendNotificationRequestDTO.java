package com.nsbm.bunmart.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendNotificationRequestDTO {

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Channel is required (EMAIL, SMS, IN_APP)")
    private String channel;

    @NotNull(message = "Template ID is required")
    private Long templateId;

    private Map<String, String> templateData;

    private String subject;

    private String referenceType;

    private String referenceId;
}
