package com.nsbm.bunmart.notification.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RuleRequestDTO {

    @NotBlank
    private String name;

    @NotBlank
    private String referenceType;

    @NotBlank
    private String channel;

    @NotBlank
    private String templateId;

    private boolean enabled;
}
