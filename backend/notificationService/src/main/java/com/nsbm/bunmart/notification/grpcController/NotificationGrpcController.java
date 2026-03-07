package com.nsbm.bunmart.notification.grpcController;

import com.nsbm.bunmart.notification.dto.SendNotificationRequestDTO;
import com.nsbm.bunmart.notification.mappers.grpc.GrpcNotificationMapper;
import com.nsbm.bunmart.notification.model.Notification;
import com.nsbm.bunmart.notification.services.NotificationService;
import com.nsbm.bunmart.notification.v1.NotificationServiceGrpc;
import com.nsbm.bunmart.notification.v1.SendNotificationRequest;
import com.nsbm.bunmart.notification.v1.SendNotificationResponse;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class NotificationGrpcController extends NotificationServiceGrpc.NotificationServiceImplBase {

    private final NotificationService notificationService;
    private final GrpcNotificationMapper grpcMapper;

    @Override
    public void sendNotification(SendNotificationRequest request,
                                 StreamObserver<SendNotificationResponse> responseObserver) {
        SendNotificationRequestDTO dto = grpcMapper.toSendNotificationRequestDTO(request);
        Notification notification = notificationService.sendNotification(dto);
        SendNotificationResponse response = grpcMapper.toSendNotificationResponse(notification);
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
