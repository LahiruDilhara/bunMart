package com.nsbm.bunmart.notification.controller;

import com.nsbm.bunmart.notification.dto.NotificationResponseDTO;
import com.nsbm.bunmart.notification.dto.SendNotificationRequestDTO;
import com.nsbm.bunmart.notification.mappers.rest.NotificationMapper;
import com.nsbm.bunmart.notification.model.Notification;
import com.nsbm.bunmart.notification.services.NotificationService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationMapper mapper;

    public NotificationController(NotificationService notificationService, NotificationMapper mapper) {
        this.notificationService = notificationService;
        this.mapper = mapper;
    }

    @PostMapping
    public ResponseEntity<NotificationResponseDTO> sendNotification(
            @Valid @RequestBody SendNotificationRequestDTO request) {

        Notification notification = notificationService.sendNotification(
                request.getUserId(),
                request.getChannel(),
                request.getTemplateId(),
                request.getTemplateData(),
                request.getSubject(),
                request.getReferenceType(),
                request.getReferenceId()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapper.toNotificationResponseDTO(notification));
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponseDTO>> getAllNotifications() {
        List<NotificationResponseDTO> list = notificationService.getAllNotifications()
                .stream()
                .map(mapper::toNotificationResponseDTO)
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationResponseDTO> getNotificationById(@PathVariable Long id) {
        Notification notification = notificationService.getNotificationById(id);
        return ResponseEntity.ok(mapper.toNotificationResponseDTO(notification));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponseDTO>> getNotificationsByUser(@PathVariable String userId) {
        List<NotificationResponseDTO> list = notificationService.getNotificationsByUserId(userId)
                .stream()
                .map(mapper::toNotificationResponseDTO)
                .toList();
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}
