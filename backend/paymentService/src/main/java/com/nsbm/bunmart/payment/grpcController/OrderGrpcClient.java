package com.nsbm.bunmart.payment.grpcController;

import com.nsbm.bunmart.order.v1.NotifyPaymentResultRequest;
import com.nsbm.bunmart.order.v1.NotifyPaymentResultResponse;
import com.nsbm.bunmart.order.v1.OrderServiceGrpc;
import io.grpc.StatusRuntimeException;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Component;

// payment service calls order service here after stripe webhook fires
// we tell order service whether payment succeeded or failed
// order service uses this to update the order status
@Component
@Slf4j
public class OrderGrpcClient {

    // "order-service" must match grpc.client.order-service in application.properties
    @GrpcClient("order-service")
    private OrderServiceGrpc.OrderServiceBlockingStub orderServiceStub;

    public void notifyPaymentResult(String orderId, String paymentId, boolean success) {
        try {
            // proto uses status as a String - "SUCCEEDED" or "FAILED"
            // not a boolean - that is why we convert it here
            String status = success ? "SUCCEEDED" : "FAILED";

            NotifyPaymentResultRequest request = NotifyPaymentResultRequest.newBuilder()
                    .setOrderId(orderId)
                    .setPaymentId(paymentId)
                    .setStatus(status)
                    .build();

            NotifyPaymentResultResponse response =
                    orderServiceStub.notifyPaymentResult(request);

            log.info("order service notified -> orderId={} acknowledged={}",
                    orderId, response.getAcknowledged());

        } catch (StatusRuntimeException e) {
            // if order service is down we log but do not crash payment service
            // payment is already saved to database so it is not lost
            log.error("could not reach order service -> orderId={} status={}",
                    orderId, e.getStatus().getCode());
        }
    }
}