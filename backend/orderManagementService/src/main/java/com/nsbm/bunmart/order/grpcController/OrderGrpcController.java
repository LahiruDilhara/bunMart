package com.nsbm.bunmart.order.grpcController;

import com.nsbm.bunmart.order.mappers.grpc.OrderGrpcMapper;
import com.nsbm.bunmart.order.model.Order;
import com.nsbm.bunmart.order.services.OrderService;
import com.nsbm.bunmart.order.v1.*;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;


@Slf4j
@GrpcService
public class OrderGrpcController extends OrderServiceGrpc.OrderServiceImplBase {

        private final OrderService orderService;
        private final OrderGrpcMapper orderGrpcMapper;

        public OrderGrpcController(OrderService orderService, OrderGrpcMapper orderGrpcMapper) {
                this.orderService = orderService;
                this.orderGrpcMapper = orderGrpcMapper;
        }

 

        @Override
        public void createOrderIntent(CreateOrderIntentRequest request,
                        StreamObserver<CreateOrderIntentResponse> responseObserver) {
                log.info("gRPC CreateOrderIntent called for userId={}", request.getUserId());
                Order order = orderService.createOrderIntent(
                                request.getUserId(),
                                request.getItemsList(),
                                request.getCartId());
                responseObserver.onNext(
                                CreateOrderIntentResponse.newBuilder()
                                                .setOrderId(String.valueOf(order.getId()))
                                                .build());
                responseObserver.onCompleted();
        }

    

        @Override
        public void getOrder(GetOrderRequest request,
                        StreamObserver<GetOrderResponse> responseObserver) {
                log.info("gRPC GetOrder called for orderId={}", request.getOrderId());
                Order order = orderService.getOrder(Integer.parseInt(request.getOrderId()));
                responseObserver.onNext(orderGrpcMapper.orderToGetOrderResponse(order));
                responseObserver.onCompleted();
        }

      

        @Override
        public void getOrderStatus(GetOrderStatusRequest request,
                        StreamObserver<GetOrderStatusResponse> responseObserver) {
                log.info("gRPC GetOrderStatus called for orderId={}", request.getOrderId());
                Order order = orderService.getOrder(Integer.parseInt(request.getOrderId()));
                responseObserver.onNext(orderGrpcMapper.orderToGetOrderStatusResponse(order));
                responseObserver.onCompleted();
        }

 

        @Override
        public void updateOrderWithDetails(UpdateOrderWithDetailsRequest request,
                        StreamObserver<UpdateOrderWithDetailsResponse> responseObserver) {
                log.info("gRPC UpdateOrderWithDetails called for orderId={}", request.getOrderId());
                Order order = orderService.updateOrderWithDetails(
                                Integer.parseInt(request.getOrderId()),
                                request.getCouponCodesList(),
                                request.getAddressId());
                responseObserver.onNext(orderGrpcMapper.orderToUpdateOrderWithDetailsResponse(order));
                responseObserver.onCompleted();
        }


        @Override
        public void requestPaymentIntent(RequestPaymentIntentRequest request,
                        StreamObserver<RequestPaymentIntentResponse> responseObserver) {
                log.info("gRPC RequestPaymentIntent called for orderId={}", request.getOrderId());
                var paymentResponse = orderService.requestPaymentIntent(
                                Integer.parseInt(request.getOrderId()));
                responseObserver.onNext(
                                RequestPaymentIntentResponse.newBuilder()
                                                .setPaymentIntentId(paymentResponse.getPaymentId())
                                                .build());
                responseObserver.onCompleted();
        }

   
        @Override
        public void notifyOrderPrepared(NotifyOrderPreparedRequest request,
                        StreamObserver<NotifyOrderPreparedResponse> responseObserver) {
                log.info("gRPC NotifyOrderPrepared called for userOrderId={}", request.getUserOrderId());
                orderService.notifyOrderPrepared(request.getUserOrderId());
                responseObserver.onNext(
                                NotifyOrderPreparedResponse.newBuilder()
                                                .setAcknowledged(true)
                                                .build());
                responseObserver.onCompleted();
        }

  

        @Override
        public void setOrderShipping(SetOrderShippingRequest request,
                        StreamObserver<SetOrderShippingResponse> responseObserver) {
                log.info("gRPC SetOrderShipping called for orderId={}", request.getOrderId());
                orderService.setOrderShipping(request.getOrderId());
                responseObserver.onNext(
                                SetOrderShippingResponse.newBuilder()
                                                .setUpdated(true)
                                                .build());
                responseObserver.onCompleted();
        }
}
