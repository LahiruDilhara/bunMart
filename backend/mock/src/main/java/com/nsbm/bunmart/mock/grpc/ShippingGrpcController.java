package com.nsbm.bunmart.mock.grpc;

import com.google.protobuf.Timestamp;
import com.nsbm.bunmart.shipping.v1.*;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

import java.time.Instant;

@Slf4j
@GrpcService
public class ShippingGrpcController extends ShippingServiceGrpc.ShippingServiceImplBase {

    private static Timestamp now() {
        return Timestamp.newBuilder().setSeconds(Instant.now().getEpochSecond()).build();
    }

    @Override
    public void createShipment(CreateShipmentRequest request, StreamObserver<CreateShipmentResponse> responseObserver) {
        String shipmentId = "SHIP-MOCK-" + request.getOrderId();
        responseObserver.onNext(CreateShipmentResponse.newBuilder()
                .setShipmentId(shipmentId)
                .setTrackingNumber("TRK-MOCK-123456")
                .setStatus("CREATED")
                .build());
        responseObserver.onCompleted();
        log.debug("createShipment: orderId={}, userId={}", request.getOrderId(), request.getUserId());
    }

    @Override
    public void getShipmentStatus(GetShipmentStatusRequest request, StreamObserver<GetShipmentStatusResponse> responseObserver) {
        responseObserver.onNext(GetShipmentStatusResponse.newBuilder()
                .setShipmentId(request.getShipmentId())
                .setOrderId("ORD-MOCK-1")
                .setTrackingNumber("TRK-MOCK-123456")
                .setStatus("IN_TRANSIT")
                .setEstimatedDelivery(Timestamp.newBuilder().setSeconds(Instant.now().plusSeconds(86400 * 2).getEpochSecond()).build())
                .setUpdatedAt(now())
                .build());
        responseObserver.onCompleted();
        log.debug("getShipmentStatus: shipmentId={}", request.getShipmentId());
    }

    @Override
    public void updateShipmentStatus(UpdateShipmentStatusRequest request, StreamObserver<UpdateShipmentStatusResponse> responseObserver) {
        responseObserver.onNext(UpdateShipmentStatusResponse.newBuilder().setUpdated(true).build());
        responseObserver.onCompleted();
        log.debug("updateShipmentStatus: shipmentId={}, status={}", request.getShipmentId(), request.getStatus());
    }
}
