package com.nsbm.bunmart.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminSendNotificationRequestDTO {

    @NotNull(message = "User IDs list is required")
    private List<String> userIds;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Body is required")
    private String body;
}
