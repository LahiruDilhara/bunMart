package com.nsbm.bunmart.notification.grpcController;

import com.nsbm.bunmart.notification.mappers.grpc.GrpcNotificationMapper;
import com.nsbm.bunmart.notification.model.Notification;
import com.nsbm.bunmart.notification.services.NotificationService;
import com.nsbm.bunmart.notification.v1.NotificationServiceGrpc;
import com.nsbm.bunmart.notification.v1.SendNotificationRequest;
import com.nsbm.bunmart.notification.v1.SendNotificationResponse;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

import java.util.Map;

@Slf4j
@GrpcService
public class NotificationGrpcController extends NotificationServiceGrpc.NotificationServiceImplBase {

    private final NotificationService notificationService;
    private final GrpcNotificationMapper grpcMapper;

    public NotificationGrpcController(NotificationService notificationService,
                                      GrpcNotificationMapper grpcMapper) {
        this.notificationService = notificationService;
        this.grpcMapper = grpcMapper;
    }

    @Override
    public void sendNotification(SendNotificationRequest request,
                                 StreamObserver<SendNotificationResponse> responseObserver) {

        log.info("gRPC SendNotification called for user={} channel={} template={}",
                request.getUserId(), request.getChannel(), request.getTemplateId());

        Map<String, String> templateData = request.getTemplateDataMap();

        // Proto sends template_id as string, parse to Long for MySQL
        Long templateId = Long.parseLong(request.getTemplateId());

        Notification notification = notificationService.sendNotification(
                request.getUserId(),
                request.getChannel(),
                templateId,
                templateData,
                request.getSubject(),
                request.getReferenceType(),
                request.getReferenceId()
        );

        SendNotificationResponse response = grpcMapper.toSendNotificationResponse(notification);
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
