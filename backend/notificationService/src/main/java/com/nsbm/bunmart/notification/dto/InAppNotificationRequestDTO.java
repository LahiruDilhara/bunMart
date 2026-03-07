package com.nsbm.bunmart.notification.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InAppNotificationRequestDTO {

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Body is required")
    private String body;

    private String referenceType;
    private String referenceId;
}
