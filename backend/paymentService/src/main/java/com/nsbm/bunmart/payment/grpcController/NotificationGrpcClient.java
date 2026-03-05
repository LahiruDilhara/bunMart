package com.nsbm.bunmart.payment.grpcController;

import com.nsbm.bunmart.notification.v1.NotificationServiceGrpc;
import com.nsbm.bunmart.notification.v1.SendNotificationRequest;
import com.nsbm.bunmart.notification.v1.SendNotificationResponse;
import io.grpc.StatusRuntimeException;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Component;

// payment service calls notification service here after payment succeeds
// notification service sends the receipt email to the user
@Component
@Slf4j
public class NotificationGrpcClient {

    @GrpcClient("notification-service")
    private NotificationServiceGrpc.NotificationServiceBlockingStub notificationStub;

    public void sendPaymentConfirmation(String userId, String paymentId, String orderId) {
        try {
            SendNotificationRequest request = SendNotificationRequest.newBuilder()
                    .setUserId(userId)
                    .setChannel("EMAIL")
                    .setTemplateId("payment_confirmation")
                    .putTemplateData("payment_id", paymentId)
                    .putTemplateData("order_id", orderId)
                    .setReferenceType("PAYMENT")
                    .setReferenceId(paymentId)
                    .build();

            SendNotificationResponse response =
                    notificationStub.sendNotification(request);

            log.info("payment confirmation sent -> userId={} status={}",
                    userId, response.getStatus());

        } catch (StatusRuntimeException e) {
            // notification failure should never affect the payment record
            // missing receipt email is annoying but payment is still valid
            log.error("could not send payment email -> userId={} status={}",
                    userId, e.getStatus().getCode());
        }
    }
}