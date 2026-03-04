package com.nsbm.bunmart.mock.grpc;

import com.google.protobuf.Timestamp;
import com.nsbm.bunmart.kitchen.v1.*;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

import java.time.Instant;

@Slf4j
@GrpcService
public class KitchenGrpcController extends KitchenServiceGrpc.KitchenServiceImplBase {

    private static Timestamp now() {
        return Timestamp.newBuilder().setSeconds(Instant.now().getEpochSecond()).build();
    }

    @Override
    public void createProductionOrder(CreateProductionOrderRequest request, StreamObserver<CreateProductionOrderResponse> responseObserver) {
        String productionOrderId = "PROD-MOCK-" + request.getUserOrderId();
        responseObserver.onNext(CreateProductionOrderResponse.newBuilder()
                .setProductionOrderId(productionOrderId)
                .build());
        responseObserver.onCompleted();
        log.debug("createProductionOrder: userOrderId={}", request.getUserOrderId());
    }

    @Override
    public void getProductionOrder(GetProductionOrderRequest request, StreamObserver<GetProductionOrderResponse> responseObserver) {
        ProductionOrderLine line = ProductionOrderLine.newBuilder()
                .setProductId("P001")
                .setQuantity(2)
                .build();
        ProductionOrderInfo order = ProductionOrderInfo.newBuilder()
                .setProductionOrderId(request.getProductionOrderId())
                .setUserOrderId("ORD-MOCK-1")
                .addLines(line)
                .setPhase("BAKING")
                .setProgressPercent(50)
                .addPreparationImageUrls("/prep/mock-1.jpg")
                .setNotes("Mock kitchen order")
                .setCreatedAt(now())
                .setUpdatedAt(now())
                .build();
        responseObserver.onNext(GetProductionOrderResponse.newBuilder().setOrder(order).build());
        responseObserver.onCompleted();
        log.debug("getProductionOrder: productionOrderId={}", request.getProductionOrderId());
    }

    @Override
    public void updateProductionPhase(UpdateProductionPhaseRequest request, StreamObserver<UpdateProductionPhaseResponse> responseObserver) {
        responseObserver.onNext(UpdateProductionPhaseResponse.newBuilder().setUpdated(true).build());
        responseObserver.onCompleted();
        log.debug("updateProductionPhase: productionOrderId={}, phase={}", request.getProductionOrderId(), request.getPhase());
    }
}
