package com.nsbm.bunmart.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TemplateResponseDTO {

    private Long id;
    private String name;
    private String channel;
    private String subject;
    private String body;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
