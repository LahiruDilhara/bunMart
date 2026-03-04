package com.nsbm.bunmart.kitchen.grpc;

import com.nsbm.kitchen.stubs.KitchenServiceGrpc; // From your kitchen.proto
import com.nsbm.kitchen.stubs.KitchenStatusResponse;
import com.nsbm.kitchen.stubs.OrderIdRequest;
import com.nsbm.bunmart.kitchen.services.KitchenService;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.server.service.GrpcService;

@GrpcService
@RequiredArgsConstructor
public class GrpcController extends KitchenServiceGrpc.KitchenServiceImplBase {
    private final KitchenService kitchenService;

    @Override
    public void getKitchenOrderStatus(OrderIdRequest req, StreamObserver<KitchenStatusResponse> resp) {
        var order = kitchenService.getOrderById(req.getOrderId());
        resp.onNext(KitchenStatusResponse.newBuilder().setStatus(order.getStatus()).build());
        resp.onCompleted();
    }
}
