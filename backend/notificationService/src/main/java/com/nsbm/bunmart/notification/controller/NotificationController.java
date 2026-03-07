package com.nsbm.bunmart.notification.controller;

import com.nsbm.bunmart.notification.dto.*;
import com.nsbm.bunmart.notification.mappers.rest.NotificationMapper;
import com.nsbm.bunmart.notification.model.Notification;
import com.nsbm.bunmart.notification.services.NotificationService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    /** Send in-app notification without template (e.g. from system or admin single-user). */
    @PostMapping("/in-app")
    public ResponseEntity<NotificationResponseDTO> sendInApp(
            @Valid @RequestBody InAppNotificationRequestDTO request) {
        Notification n = notificationService.sendInAppDirect(
                request.getUserId(),
                request.getSubject(),
                request.getBody(),
                request.getReferenceType(),
                request.getReferenceId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toNotificationResponseDTO(n));
    }

    /** Admin: send the same in-app notification to multiple users. */
    @PostMapping("/admin/send")
    public ResponseEntity<List<NotificationResponseDTO>> adminSendToUsers(
            @Valid @RequestBody AdminSendNotificationRequestDTO request) {
        List<Notification> list = notificationService.sendInAppToUsers(
                request.getUserIds(),
                request.getSubject(),
                request.getBody()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(list.stream().map(mapper::toNotificationResponseDTO).toList());
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable String userId) {
        long count = notificationService.getUnreadCountByUserId(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponseDTO> markAsRead(@PathVariable Long id) {
        Notification n = notificationService.markAsRead(id);
        return ResponseEntity.ok(mapper.toNotificationResponseDTO(n));
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
    public ResponseEntity<List<NotificationResponseDTO>> getNotificationsByUser(
            @PathVariable String userId,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "50") int size) {
        List<NotificationResponseDTO> list = notificationService.getNotificationsByUserId(userId, page, size)
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
