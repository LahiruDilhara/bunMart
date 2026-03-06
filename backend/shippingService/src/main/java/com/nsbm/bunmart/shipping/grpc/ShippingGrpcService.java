//package com.nsbm.bunmart.shipping.grpc;
//
//import com.nsbm.bunmart.shipping.dto.ShippingIntentDTO;
//import com.nsbm.bunmart.shipping.model.ShippingIntentStatus;
//import com.nsbm.bunmart.shipping.services.ShippingIntentService;
//import com.nsbm.bunmart.shipping.v1.*;
//import com.nsbm.bunmart.order.v1.*;
//import io.grpc.ManagedChannel;
//import io.grpc.ManagedChannelBuilder;
//import io.grpc.stub.StreamObserver;
//import net.devh.boot.grpc.server.service.GrpcService;
//
//@GrpcService
//public class ShippingGrpcService extends ShippingServiceGrpc.ShippingServiceImplBase {
//
//    private final ShippingIntentService shippingIntentService;
//    private final OrderServiceGrpc.OrderServiceBlockingStub orderStub;
//
//    public ShippingGrpcService(ShippingIntentService shippingIntentService) {
//        this.shippingIntentService = shippingIntentService;
//
//        // Connect to mock Order Service (localhost:9090)
//        ManagedChannel channel = ManagedChannelBuilder.forAddress("localhost", 9090)
//                .usePlaintext()
//                .build();
//        this.orderStub = OrderServiceGrpc.newBlockingStub(channel);
//    }
//
//    @Override
//    public void createShipment(CreateShipmentRequest request,
//                               StreamObserver<CreateShipmentResponse> responseObserver) {
//
//        // 1️⃣ Call Order gRPC to get order details
//        GetOrderResponse orderResponse = orderStub.getOrder(
//                GetOrderRequest.newBuilder()
//                        .setOrderId(request.getOrderId())
//                        .build()
//        );
//
//        // 2️⃣ Create Shipping Intent using order info
//        ShippingIntentDTO intentDTO = ShippingIntentDTO.builder()
//                .orderId(Integer.valueOf(orderResponse.getOrder().getOrderId().replaceAll("\\D","")))
//                .userId(Integer.valueOf(orderResponse.getOrder().getUserId().replaceAll("\\D","")))
//                .addressId(Integer.valueOf(orderResponse.getOrder().getShippingAddressId().replaceAll("\\D","")))
//                .status(ShippingIntentStatus.PENDING)
//                .build();
//
//        ShippingIntentDTO savedIntent = shippingIntentService.createShippingIntentFromOrder(Integer.valueOf("101"));
//
//        // 3️⃣ Return gRPC response
//        CreateShipmentResponse response = CreateShipmentResponse.newBuilder()
//                .setShipmentId(String.valueOf(savedIntent.getShipping_intent_id()))
//                .setTrackingNumber("TRK-" + savedIntent.getShipping_intent_id())
//                .setStatus(savedIntent.getStatus().name())
//                .build();
//
//        responseObserver.onNext(response);
//        responseObserver.onCompleted();
//    }
//}