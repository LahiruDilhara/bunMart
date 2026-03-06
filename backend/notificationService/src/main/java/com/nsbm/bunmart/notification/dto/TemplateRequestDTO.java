package com.nsbm.bunmart.notification.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TemplateRequestDTO {

    @NotBlank
    private String name;

    @NotBlank
    private String channel;

    private String subject;

    @NotBlank
    private String body;
}
