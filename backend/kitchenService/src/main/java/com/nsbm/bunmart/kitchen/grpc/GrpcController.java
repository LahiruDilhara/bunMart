package com.nsbm.bunmart.kitchen.grpc;
import com.nsbm.bunmart.kitchen.services.KitchenService;import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.server.service.GrpcService;

@GrpcService
@RequiredArgsConstructor
public class GrpcController extends KitchenServiceGrpc.KitchenServiceImplBase {
    private final KitchenService kitchenService;

    @Override
    public void getKitchenStatus(OrderIdRequest req, StreamObserver<KitchenStatusResponse> resp) {
        var order = kitchenService.getOrderById(req.getOrderId());
        resp.onNext(KitchenStatusResponse.newBuilder().setStatus(order.getStatus()).build());
        resp.onCompleted();
    }
}
