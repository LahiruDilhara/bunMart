package com.nsbm.bunmart.kitchen.grpcController;

import com.nsbm.bunmart.kitchen.mappers.grpc.GrpcMapper;
import com.nsbm.bunmart.kitchen.model.ProductionLine;
import com.nsbm.bunmart.kitchen.model.ProductionOrder;
import com.nsbm.bunmart.kitchen.services.KitchenService;
import com.nsbm.bunmart.kitchen.v1.*;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@GrpcService
public class KitchenGrpcController extends KitchenServiceGrpc.KitchenServiceImplBase {

    private final KitchenService kitchenService;
    private final GrpcMapper grpcMapper;

    public KitchenGrpcController(KitchenService kitchenService, GrpcMapper grpcMapper) {
        this.kitchenService = kitchenService;
        this.grpcMapper = grpcMapper;
    }

    @Override
    public void createProductionOrder(CreateProductionOrderRequest request,
                                      StreamObserver<CreateProductionOrderResponse> responseObserver) {
        List<ProductionLine> lines = new ArrayList<>();
        for (ProductionOrderLine protoLine : request.getLinesList()) {
            ProductionLine line = new ProductionLine();
            line.setProductId(protoLine.getProductId());
            line.setQuantity(protoLine.getQuantity());
            lines.add(line);
        }

        ProductionOrder order = kitchenService.createProductionOrder(request.getUserOrderId(), lines);

        responseObserver.onNext(grpcMapper.toCreateResponse(order.getId()));
        responseObserver.onCompleted();
    }

    @Override
    public void getProductionOrder(GetProductionOrderRequest request,
                                   StreamObserver<GetProductionOrderResponse> responseObserver) {
        ProductionOrder order = kitchenService.getProductionOrder(request.getProductionOrderId());

        responseObserver.onNext(grpcMapper.toGetResponse(order));
        responseObserver.onCompleted();
    }

    @Override
    public void updateProductionPhase(UpdateProductionPhaseRequest request,
                                      StreamObserver<UpdateProductionPhaseResponse> responseObserver) {
        kitchenService.updatePhase(
                request.getProductionOrderId(),
                request.getPhase(),
                request.getProgressPercent()
        );

        responseObserver.onNext(UpdateProductionPhaseResponse.newBuilder().setUpdated(true).build());
        responseObserver.onCompleted();
    }
}
