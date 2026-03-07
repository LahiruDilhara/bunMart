package com.nsbm.bunmart.notification.mappers.grpc;

import com.nsbm.bunmart.notification.dto.SendNotificationRequestDTO;
import com.nsbm.bunmart.notification.model.Notification;
import com.nsbm.bunmart.notification.v1.SendNotificationRequest;
import com.nsbm.bunmart.notification.v1.SendNotificationResponse;
import com.google.protobuf.Timestamp;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;

/**
 * Maps between notification domain models/DTOs and notification proto messages.
 */
@Component
public class GrpcNotificationMapper {

    /**
     * Converts gRPC request to DTO for use by the service layer.
     */
    public SendNotificationRequestDTO toSendNotificationRequestDTO(SendNotificationRequest request) {
        SendNotificationRequestDTO dto = new SendNotificationRequestDTO();
        dto.setUserId(request.getUserId());
        dto.setChannel(request.getChannel());
        dto.setTemplateId(Long.parseLong(request.getTemplateId()));
        dto.setTemplateData(new HashMap<>(request.getTemplateDataMap()));
        dto.setSubject(request.getSubject());
        dto.setReferenceType(request.getReferenceType());
        dto.setReferenceId(request.getReferenceId());
        return dto;
    }

    /**
     * Maps persisted Notification model to gRPC response (id, status, body, created_at).
     */
    public SendNotificationResponse toSendNotificationResponse(Notification notification) {
        SendNotificationResponse.Builder builder = SendNotificationResponse.newBuilder()
                .setNotificationId(String.valueOf(notification.getId()))
                .setStatus(notification.getStatus() != null ? notification.getStatus() : "UNKNOWN");
        if (notification.getBody() != null) {
            builder.setBody(notification.getBody());
        }
        if (notification.getCreatedAt() != null) {
            builder.setCreatedAt(toTimestamp(notification.getCreatedAt()));
        }
        return builder.build();
    }

    private static Timestamp toTimestamp(LocalDateTime dateTime) {
        return Timestamp.newBuilder()
                .setSeconds(dateTime.toInstant(ZoneOffset.UTC).getEpochSecond())
                .setNanos(dateTime.getNano())
                .build();
    }
}
