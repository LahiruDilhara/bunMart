package com.nsbm.bunmart.order.grpcController;

import com.nsbm.bunmart.order.dto.UpdateOrderRequestDTO;
import com.nsbm.bunmart.order.mappers.grpc.GRPCMapper;
import com.nsbm.bunmart.order.model.Order;
import com.nsbm.bunmart.order.services.OrderService;
import com.nsbm.bunmart.order.v1.*;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class GrpcController extends OrderServiceGrpc.OrderServiceImplBase {

    private final OrderService orderService;
    private final GRPCMapper grpcMapper;

    @Override
    public void getOrder(GetOrderRequest request, StreamObserver<GetOrderResponse> responseObserver) {
        Order order = orderService.getOrderForUser(request.getUserId(), request.getOrderId());
        GetOrderResponse response = grpcMapper.toGetOrderResponse(order);
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void updateOrder(UpdateOrderRequest request, StreamObserver<UpdateOrderResponse> responseObserver) {
        UpdateOrderRequestDTO dto = grpcMapper.toUpdateOrderRequestDTO(request);
        Order order = orderService.updateOrder(request.getOrderId(), request.getUserId(), dto);
        UpdateOrderResponse response = grpcMapper.toUpdateOrderResponse(order);
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
