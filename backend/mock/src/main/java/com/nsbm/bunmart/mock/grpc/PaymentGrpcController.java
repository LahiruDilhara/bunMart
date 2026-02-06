package com.nsbm.bunmart.mock.grpc;

import com.google.protobuf.Timestamp;
import com.nsbm.bunmart.payment.v1.*;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

import java.time.Instant;

@Slf4j
@GrpcService
public class PaymentGrpcController extends PaymentServiceGrpc.PaymentServiceImplBase {

    private static Timestamp now() {
        return Timestamp.newBuilder().setSeconds(Instant.now().getEpochSecond()).build();
    }

    @Override
    public void createPaymentIntent(CreatePaymentIntentRequest request, StreamObserver<CreatePaymentIntentResponse> responseObserver) {
        String paymentId = "pay-mock-" + request.getOrderId();
        responseObserver.onNext(CreatePaymentIntentResponse.newBuilder()
                .setPaymentId(paymentId)
                .setClientSecret("pi_mock_secret_" + paymentId)
                .setStatus("requires_payment_method")
                .build());
        responseObserver.onCompleted();
        log.debug("createPaymentIntent: orderId={}, amount={}", request.getOrderId(), request.getAmount());
    }

    @Override
    public void getPaymentIntent(GetPaymentIntentRequest request, StreamObserver<GetPaymentIntentResponse> responseObserver) {
        responseObserver.onNext(GetPaymentIntentResponse.newBuilder()
                .setPaymentId(request.getPaymentId())
                .setClientSecret("pi_mock_secret_" + request.getPaymentId())
                .setStatus("succeeded")
                .build());
        responseObserver.onCompleted();
        log.debug("getPaymentIntent: paymentId={}", request.getPaymentId());
    }

    @Override
    public void getPaymentStatus(GetPaymentStatusRequest request, StreamObserver<GetPaymentStatusResponse> responseObserver) {
        responseObserver.onNext(GetPaymentStatusResponse.newBuilder()
                .setPaymentId(request.getPaymentId())
                .setStatus("succeeded")
                .setOrderId("ORD-MOCK-1")
                .setUpdatedAt(now())
                .build());
        responseObserver.onCompleted();
        log.debug("getPaymentStatus: paymentId={}", request.getPaymentId());
    }

    @Override
    public void confirmPayment(ConfirmPaymentRequest request, StreamObserver<ConfirmPaymentResponse> responseObserver) {
        responseObserver.onNext(ConfirmPaymentResponse.newBuilder()
                .setSuccess(true)
                .setStatus("succeeded")
                .build());
        responseObserver.onCompleted();
        log.debug("confirmPayment: paymentId={}", request.getPaymentId());
    }
}
