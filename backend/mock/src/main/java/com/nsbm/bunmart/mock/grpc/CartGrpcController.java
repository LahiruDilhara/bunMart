package com.nsbm.bunmart.mock.grpc;

import com.nsbm.bunmart.cart.v1.*;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

@Slf4j
@GrpcService
public class CartGrpcController extends CartServiceGrpc.CartServiceImplBase {

    @Override
    public void getCart(GetCartRequest request, StreamObserver<GetCartResponse> responseObserver) {
        CartItemInfo item1 = CartItemInfo.newBuilder()
                .setCartItemId("item-1")
                .setProductId("P001")
                .setQuantity(2)
                .build();
        CartItemInfo item2 = CartItemInfo.newBuilder()
                .setCartItemId("item-2")
                .setProductId("P002")
                .setQuantity(1)
                .build();
        CartInfo cartInfo = CartInfo.newBuilder()
                .setCartId("CART-MOCK-" + request.getUserId())
                .setUserId(request.getUserId())
                .addItems(item1)
                .addItems(item2)
                .setTotal("29.99")
                .build();
        responseObserver.onNext(GetCartResponse.newBuilder().setCart(cartInfo).build());
        responseObserver.onCompleted();
        log.debug("getCart: userId={}", request.getUserId());
    }

    @Override
    public void addCartItem(AddCartItemRequest request, StreamObserver<AddCartItemResponse> responseObserver) {
        CartItemInfo newItem = CartItemInfo.newBuilder()
                .setCartItemId("item-new")
                .setProductId(request.getProductId())
                .setQuantity(request.getQuantity())
                .build();
        CartInfo cartInfo = CartInfo.newBuilder()
                .setCartId("CART-MOCK-" + request.getUserId())
                .setUserId(request.getUserId())
                .addItems(newItem)
                .setTotal("0.00")
                .build();
        responseObserver.onNext(AddCartItemResponse.newBuilder()
                .setCartId("CART-MOCK-" + request.getUserId())
                .setCart(cartInfo)
                .build());
        responseObserver.onCompleted();
        log.debug("addCartItem: userId={}, productId={}", request.getUserId(), request.getProductId());
    }

    @Override
    public void invalidateCart(InvalidateCartRequest request, StreamObserver<InvalidateCartResponse> responseObserver) {
        responseObserver.onNext(InvalidateCartResponse.newBuilder().setInvalidated(true).build());
        responseObserver.onCompleted();
        log.debug("invalidateCart: userId={}, productIds={}", request.getUserId(), request.getProductIdsList());
    }
}
