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

    @NotBlank
    private String userId;

    @NotBlank
    private String channel;

    @NotNull
    private Long templateId;

    private Map<String, String> templateData;

    private String subject;

    private String referenceType;

    private String referenceId;
}
