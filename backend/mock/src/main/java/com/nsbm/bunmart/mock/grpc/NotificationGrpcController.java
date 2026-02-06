package com.nsbm.bunmart.mock.grpc;

import com.nsbm.bunmart.notification.v1.*;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

@Slf4j
@GrpcService
public class NotificationGrpcController extends NotificationServiceGrpc.NotificationServiceImplBase {

    @Override
    public void sendNotification(SendNotificationRequest request, StreamObserver<SendNotificationResponse> responseObserver) {
        String notificationId = "NOTIF-MOCK-" + request.getUserId() + "-" + System.currentTimeMillis();
        responseObserver.onNext(SendNotificationResponse.newBuilder()
                .setNotificationId(notificationId)
                .setStatus("SENT")
                .build());
        responseObserver.onCompleted();
        log.debug("sendNotification: userId={}, channel={}, templateId={}", request.getUserId(), request.getChannel(), request.getTemplateId());
    }
}
