package com.nsbm.bunmart.kitchen.grpcController;

import com.nsbm.bunmart.kitchen.dto.CreateKitchenOrderRequestDTO;
import com.nsbm.bunmart.kitchen.mappers.grpc.GRPCMapper;
import com.nsbm.bunmart.kitchen.model.KitchenOrder;
import com.nsbm.bunmart.kitchen.services.KitchenService;
import com.nsbm.bunmart.kitchen.v1.*;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

import java.util.List;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class GrpcController extends KitchenServiceGrpc.KitchenServiceImplBase {

    private final KitchenService kitchenService;
    private final GRPCMapper grpcMapper;

    @Override
    public void createKitchenOrder(CreateKitchenOrderRequest request, StreamObserver<CreateKitchenOrderResponse> responseObserver) {
        List<CreateKitchenOrderRequestDTO.LineItemDTO> lines = grpcMapper.toLineItemDTOs(request);
        KitchenOrder order = kitchenService.createKitchenOrder(request.getUserId(), request.getOrderId(), lines);
        CreateKitchenOrderResponse response = grpcMapper.toCreateKitchenOrderResponse(order);
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void getKitchenOrder(GetKitchenOrderRequest request, StreamObserver<GetKitchenOrderResponse> responseObserver) {
        KitchenOrder order = kitchenService.getKitchenOrder(request.getKitchenOrderId());
        GetKitchenOrderResponse response = grpcMapper.toGetKitchenOrderResponse(order);
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void updateKitchenOrderStatus(UpdateKitchenOrderStatusRequest request, StreamObserver<UpdateKitchenOrderStatusResponse> responseObserver) {
        KitchenOrder order = kitchenService.updateKitchenOrderStatus(request.getKitchenOrderId(), request.getStatus());
        UpdateKitchenOrderStatusResponse response = grpcMapper.toUpdateKitchenOrderStatusResponse(true);
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
