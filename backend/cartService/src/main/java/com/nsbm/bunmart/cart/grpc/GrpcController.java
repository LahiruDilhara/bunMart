package com.nsbm.bunmart.cart.grpc;

import com.nsbm.bunmart.cart.v1.*;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

@Slf4j
@GrpcService
public class GrpcController extends CartServiceGrpc.CartServiceImplBase {

    @Override
    public void getCart(GetCartRequest request, StreamObserver<GetCartResponse> responseObserver) {
        // Create some dummy CartItemInfo
        CartItemInfo item1 = CartItemInfo.newBuilder()
                .setProductId("P001")
                .setQuantity(2)
                .build();

        CartItemInfo item2 = CartItemInfo.newBuilder()
                .setProductId("P002")
                .setQuantity(1)
                .build();

        // Create dummy CartInfo
        CartInfo cartInfo = CartInfo.newBuilder()
                .setCartId("CART123")
                .setUserId(request.getUserId())  // echo request userId for test
                .addItems(item1)
                .addItems(item2)
                .setTotal("5")
                .build();

        // Build GetCartResponse
        GetCartResponse response = GetCartResponse.newBuilder()
                .setCart(cartInfo)
                .build();

        // Send response
        responseObserver.onNext(response);

        // Complete the RPC
        responseObserver.onCompleted();
        log.info("getCart response: {}", response);
    }

    @Override
    public void addCartItem(AddCartItemRequest request, StreamObserver<AddCartItemResponse> responseObserver) {
        super.addCartItem(request, responseObserver);
    }

    @Override
    public void getCartForCheckout(GetCartForCheckoutRequest request, StreamObserver<GetCartForCheckoutResponse> responseObserver) {
        super.getCartForCheckout(request, responseObserver);
    }

    @Override
    public void invalidateCart(InvalidateCartRequest request, StreamObserver<InvalidateCartResponse> responseObserver) {
        super.invalidateCart(request, responseObserver);
    }
}
