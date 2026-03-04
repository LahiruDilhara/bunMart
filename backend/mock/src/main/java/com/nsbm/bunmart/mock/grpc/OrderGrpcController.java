package com.nsbm.bunmart.mock.grpc;

import com.google.protobuf.Timestamp;
import com.nsbm.bunmart.order.v1.*;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

import java.time.Instant;

@Slf4j
@GrpcService
public class OrderGrpcController extends OrderServiceGrpc.OrderServiceImplBase {

    private static Timestamp now() {
        return Timestamp.newBuilder().setSeconds(Instant.now().getEpochSecond()).build();
    }

    @Override
    public void createOrderIntent(CreateOrderIntentRequest request, StreamObserver<CreateOrderIntentResponse> responseObserver) {
        String orderId = "ORD-MOCK-" + request.getUserId() + "-" + System.currentTimeMillis();
        responseObserver.onNext(CreateOrderIntentResponse.newBuilder().setOrderId(orderId).build());
        responseObserver.onCompleted();
        log.debug("createOrderIntent: userId={}, cartId={}", request.getUserId(), request.getCartId());
    }

    @Override
    public void getOrder(GetOrderRequest request, StreamObserver<GetOrderResponse> responseObserver) {
        OrderLineInfo line = OrderLineInfo.newBuilder()
                .setProductId("P001")
                .setQuantity(2)
                .setUnitPrice("4.99")
                .setLineTotal("9.98")
                .build();
        OrderInfo order = OrderInfo.newBuilder()
                .setOrderId(request.getOrderId())
                .setUserId("user-mock")
                .setStatus("CONFIRMED")
                .addLines(line)
                .setSubtotal("9.98")
                .setDiscountTotal("0.00")
                .setShippingTotal("2.99")
                .setTotal("12.97")
                .setCurrencyCode("USD")
                .setShippingAddressId("addr-mock-1")
                .setCreatedAt(now())
                .setUpdatedAt(now())
                .build();
        responseObserver.onNext(GetOrderResponse.newBuilder().setOrder(order).build());
        responseObserver.onCompleted();
        log.debug("getOrder: orderId={}", request.getOrderId());
    }

    @Override
    public void getOrderStatus(GetOrderStatusRequest request, StreamObserver<GetOrderStatusResponse> responseObserver) {
        responseObserver.onNext(GetOrderStatusResponse.newBuilder()
                .setOrderId(request.getOrderId())
                .setStatus("CONFIRMED")
                .setUpdatedAt(now())
                .build());
        responseObserver.onCompleted();
        log.debug("getOrderStatus: orderId={}", request.getOrderId());
    }

    @Override
    public void updateOrderWithDetails(UpdateOrderWithDetailsRequest request, StreamObserver<UpdateOrderWithDetailsResponse> responseObserver) {
        OrderLineInfo line = OrderLineInfo.newBuilder()
                .setProductId("P001")
                .setQuantity(1)
                .setUnitPrice("4.99")
                .setLineTotal("4.99")
                .build();
        OrderInfo order = OrderInfo.newBuilder()
                .setOrderId(request.getOrderId())
                .setUserId("user-mock")
                .setStatus("UPDATED")
                .addLines(line)
                .setSubtotal("4.99")
                .setDiscountTotal("0.00")
                .setShippingTotal("2.99")
                .setTotal("7.98")
                .setCurrencyCode("USD")
                .setShippingAddressId(request.getAddressId())
                .setCreatedAt(now())
                .setUpdatedAt(now())
                .build();
        responseObserver.onNext(UpdateOrderWithDetailsResponse.newBuilder().setOrder(order).build());
        responseObserver.onCompleted();
        log.debug("updateOrderWithDetails: orderId={}", request.getOrderId());
    }

    @Override
    public void requestPaymentIntent(RequestPaymentIntentRequest request, StreamObserver<RequestPaymentIntentResponse> responseObserver) {
        responseObserver.onNext(RequestPaymentIntentResponse.newBuilder()
                .setPaymentIntentId("pi-mock-" + request.getOrderId())
                .build());
        responseObserver.onCompleted();
        log.debug("requestPaymentIntent: orderId={}", request.getOrderId());
    }

    @Override
    public void notifyOrderPrepared(NotifyOrderPreparedRequest request, StreamObserver<NotifyOrderPreparedResponse> responseObserver) {
        responseObserver.onNext(NotifyOrderPreparedResponse.newBuilder().setAcknowledged(true).build());
        responseObserver.onCompleted();
        log.debug("notifyOrderPrepared: productionOrderId={}, userOrderId={}", request.getProductionOrderId(), request.getUserOrderId());
    }

    @Override
    public void setOrderShipping(SetOrderShippingRequest request, StreamObserver<SetOrderShippingResponse> responseObserver) {
        responseObserver.onNext(SetOrderShippingResponse.newBuilder().setUpdated(true).build());
        responseObserver.onCompleted();
        log.debug("setOrderShipping: orderId={}, shipmentId={}, status={}", request.getOrderId(), request.getShipmentId(), request.getStatus());
    }

    @Override
    public void notifyPaymentResult(NotifyPaymentResultRequest request, StreamObserver<NotifyPaymentResultResponse> responseObserver) {
        responseObserver.onNext(NotifyPaymentResultResponse.newBuilder().setAcknowledged(true).build());
        responseObserver.onCompleted();
        log.debug("notifyPaymentResult: orderId={}, paymentId={}, status={}", request.getOrderId(), request.getPaymentId(), request.getStatus());
    }
}
