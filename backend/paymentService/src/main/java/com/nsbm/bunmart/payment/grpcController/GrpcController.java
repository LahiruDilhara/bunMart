package com.nsbm.bunmart.payment.grpcController;

import com.nsbm.bunmart.payment.dto.CreatePaymentRequestDTO;
import com.nsbm.bunmart.payment.mappers.grpc.GRPCMapper;
import com.nsbm.bunmart.payment.model.Payment;
import com.nsbm.bunmart.payment.services.PaymentService;
import com.nsbm.bunmart.payment.v1.*;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class GrpcController extends PaymentServiceGrpc.PaymentServiceImplBase {

    private final PaymentService paymentService;
    private final GRPCMapper grpcMapper;

    @Override
    public void createPaymentIntent(CreatePaymentIntentRequest request, StreamObserver<CreatePaymentIntentResponse> responseObserver) {
        CreatePaymentRequestDTO dto = grpcMapper.toCreatePaymentRequestDTO(request);
        Payment payment = paymentService.createPaymentIntent(dto);
        CreatePaymentIntentResponse response = grpcMapper.toCreatePaymentIntentResponse(payment);
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void getPaymentIntent(GetPaymentIntentRequest request, StreamObserver<GetPaymentIntentResponse> responseObserver) {
        Payment payment = paymentService.getPaymentById(request.getPaymentId());
        GetPaymentIntentResponse response = grpcMapper.toGetPaymentIntentResponse(payment);
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void getPaymentStatus(GetPaymentStatusRequest request, StreamObserver<GetPaymentStatusResponse> responseObserver) {
        Payment payment = paymentService.getPaymentById(request.getPaymentId());
        GetPaymentStatusResponse response = grpcMapper.toGetPaymentStatusResponse(payment);
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void confirmPayment(ConfirmPaymentRequest request, StreamObserver<ConfirmPaymentResponse> responseObserver) {
        Payment payment = paymentService.confirmPayment(request.getPaymentId());
        ConfirmPaymentResponse response = grpcMapper.toConfirmPaymentResponse(payment);
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
