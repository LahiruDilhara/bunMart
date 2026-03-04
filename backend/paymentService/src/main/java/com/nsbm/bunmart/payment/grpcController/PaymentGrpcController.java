package com.nsbm.bunmart.payment.grpcController;

import com.google.protobuf.Timestamp;
import com.nsbm.bunmart.payment.v1.*;
import com.nsbm.bunmart.payment.errors.*;
import com.nsbm.bunmart.payment.model.Payment;
import com.nsbm.bunmart.payment.services.PaymentService;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import java.time.ZoneOffset;

// @GrpcService registers this class as a gRPC server on port 9094
// order service connects to this port and calls these methods
// think of this like @RestController but for gRPC not HTTP
// the big difference is gRPC uses binary format so it is much faster than REST
@GrpcService
@RequiredArgsConstructor
@Slf4j
public class PaymentGrpcController extends PaymentServiceGrpc.PaymentServiceImplBase {

    private final PaymentService paymentService;

    // maps our java exceptions to gRPC status codes
    // gRPC has its own status system similar to HTTP status codes
    // NOT_FOUND = 404, ALREADY_EXISTS = 409, INTERNAL = 500
    private Throwable mapToGrpcError(Exception e) {
        if (e instanceof PaymentNotFoundException) {
            return Status.NOT_FOUND
                    .withDescription(e.getMessage())
                    .asRuntimeException();
        }
        if (e instanceof PaymentAlreadyExistsException) {
            return Status.ALREADY_EXISTS
                    .withDescription(e.getMessage())
                    .asRuntimeException();
        }
        if (e instanceof InvalidPaymentStateException) {
            // FAILED_PRECONDITION means operation is not valid for current state
            return Status.FAILED_PRECONDITION
                    .withDescription(e.getMessage())
                    .asRuntimeException();
        }
        if (e instanceof PaymentProcessingException) {
            // UNAVAILABLE means stripe could not be reached
            return Status.UNAVAILABLE
                    .withDescription(e.getMessage())
                    .asRuntimeException();
        }
        if (e instanceof IllegalArgumentException) {
            return Status.INVALID_ARGUMENT
                    .withDescription(e.getMessage())
                    .asRuntimeException();
        }
        return Status.INTERNAL
                .withDescription("Internal payment service error")
                .asRuntimeException();
    }

    // RPC 1 - order service calls this when user presses pay
    // we create a payment intent on stripe and return the client_secret
    // frontend uses client_secret to show the stripe card form
    @Override
    public void createPaymentIntent(CreatePaymentIntentRequest request,
                                    StreamObserver<CreatePaymentIntentResponse> responseObserver) {
        try {
            log.info("gRPC createPaymentIntent -> orderId={}", request.getOrderId());
            if (request.getOrderId().isBlank()) {
                responseObserver.onError(Status.INVALID_ARGUMENT
                        .withDescription("order_id is required")
                        .asRuntimeException());
                return;
            }
            Payment payment = paymentService.createPaymentIntent(
                    request.getOrderId(),
                    request.getAmount(),
                    request.getCurrencyCode(),
                    request.getUserId(),
                    request.getOrderName(),
                    request.getMetadataMap());

            responseObserver.onNext(CreatePaymentIntentResponse.newBuilder()
                    .setPaymentId(payment.getPaymentId())
                    .setClientSecret(payment.getClientSecret())
                    .setStatus(payment.getStatus().name())
                    .build());
            responseObserver.onCompleted();

        } catch (Exception e) {
            log.error("gRPC createPaymentIntent failed -> {}", e.getMessage());
            responseObserver.onError(mapToGrpcError(e));
        }
    }

    // RPC 2 - get full payment details by payment id
    @Override
    public void getPaymentIntent(GetPaymentIntentRequest request,
                                 StreamObserver<GetPaymentIntentResponse> responseObserver) {
        try {
            if (request.getPaymentId().isBlank()) {
                responseObserver.onError(Status.INVALID_ARGUMENT
                        .withDescription("payment_id is required")
                        .asRuntimeException());
                return;
            }
            Payment payment = paymentService.getPaymentById(request.getPaymentId());

            responseObserver.onNext(GetPaymentIntentResponse.newBuilder()
                    .setPaymentId(payment.getPaymentId())
                    .setClientSecret(payment.getClientSecret() != null
                            ? payment.getClientSecret() : "")
                    .setStatus(payment.getStatus().name())
                    .build());
            responseObserver.onCompleted();

        } catch (Exception e) {
            responseObserver.onError(mapToGrpcError(e));
        }
    }

    // RPC 3 - check if payment is pending, succeeded or failed
    // order service uses this to know when to update order status
    @Override
    public void getPaymentStatus(GetPaymentStatusRequest request,
                                 StreamObserver<GetPaymentStatusResponse> responseObserver) {
        try {
            if (request.getPaymentId().isBlank()) {
                responseObserver.onError(Status.INVALID_ARGUMENT
                        .withDescription("payment_id is required")
                        .asRuntimeException());
                return;
            }
            Payment payment = paymentService.getPaymentById(request.getPaymentId());

            // convert java LocalDateTime to protobuf Timestamp format
            Timestamp updatedAt = Timestamp.newBuilder()
                    .setSeconds(payment.getUpdatedAt().toEpochSecond(ZoneOffset.UTC))
                    .build();

            responseObserver.onNext(GetPaymentStatusResponse.newBuilder()
                    .setPaymentId(payment.getPaymentId())
                    .setStatus(payment.getStatus().name())
                    .setOrderId(payment.getOrderId())
                    .setUpdatedAt(updatedAt)
                    .build());
            responseObserver.onCompleted();

        } catch (Exception e) {
            responseObserver.onError(mapToGrpcError(e));
        }
    }

    // RPC 4 - manually confirm a payment
    // normally stripe webhook handles this automatically
    // admin uses this if webhook fails for some reason
    @Override
    public void confirmPayment(ConfirmPaymentRequest request,
                               StreamObserver<ConfirmPaymentResponse> responseObserver) {
        try {
            if (request.getPaymentId().isBlank()) {
                responseObserver.onError(Status.INVALID_ARGUMENT
                        .withDescription("payment_id is required")
                        .asRuntimeException());
                return;
            }
            Payment payment = paymentService.confirmPayment(request.getPaymentId());

            responseObserver.onNext(ConfirmPaymentResponse.newBuilder()
                    .setSuccess(true)
                    .setStatus(payment.getStatus().name())
                    .build());
            responseObserver.onCompleted();

        } catch (Exception e) {
            responseObserver.onError(mapToGrpcError(e));
        }
    }
}