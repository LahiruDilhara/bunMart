package com.nsbm.bunmart.notification.controller;

import com.nsbm.bunmart.notification.dto.TemplateRequestDTO;
import com.nsbm.bunmart.notification.dto.TemplateResponseDTO;
import com.nsbm.bunmart.notification.mappers.rest.NotificationMapper;
import com.nsbm.bunmart.notification.model.NotificationTemplate;
import com.nsbm.bunmart.notification.services.NotificationService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/templates")
public class TemplateController {

    private final NotificationService notificationService;
    private final NotificationMapper mapper;

    public TemplateController(NotificationService notificationService, NotificationMapper mapper) {
        this.notificationService = notificationService;
        this.mapper = mapper;
    }

    @PostMapping
    public ResponseEntity<TemplateResponseDTO> createTemplate(@Valid @RequestBody TemplateRequestDTO request) {
        NotificationTemplate template = mapper.toTemplateEntity(request);
        NotificationTemplate saved = notificationService.createTemplate(template);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toTemplateResponseDTO(saved));
    }

    @GetMapping
    public ResponseEntity<List<TemplateResponseDTO>> getAllTemplates() {
        List<TemplateResponseDTO> list = notificationService.getAllTemplates()
                .stream()
                .map(mapper::toTemplateResponseDTO)
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TemplateResponseDTO> getTemplateById(@PathVariable Long id) {
        NotificationTemplate template = notificationService.getTemplateById(id);
        return ResponseEntity.ok(mapper.toTemplateResponseDTO(template));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TemplateResponseDTO> updateTemplate(@PathVariable Long id,
                                                              @Valid @RequestBody TemplateRequestDTO request) {
        NotificationTemplate template = mapper.toTemplateEntity(request);
        NotificationTemplate updated = notificationService.updateTemplate(id, template);
        return ResponseEntity.ok(mapper.toTemplateResponseDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        notificationService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }
}
