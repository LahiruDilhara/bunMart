package com.nsbm.bunmart.notification.mappers.grpc;

import com.nsbm.bunmart.notification.model.Notification;
import com.nsbm.bunmart.notification.v1.SendNotificationResponse;
import org.springframework.stereotype.Component;

@Component
public class GrpcNotificationMapper {

    public SendNotificationResponse toSendNotificationResponse(Notification notification) {
        return SendNotificationResponse.newBuilder()
                .setNotificationId(String.valueOf(notification.getId()))
                .setStatus(notification.getStatus())
                .build();
    }
}
