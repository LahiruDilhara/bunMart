package com.nsbm.bunmart.cart.grpcController;

import com.nsbm.bunmart.cart.errors.CartNotExistsException;
import com.nsbm.bunmart.cart.errors.DatabaseExceptionException;
import com.nsbm.bunmart.cart.mappers.grpc.GRPCMapper;
import com.nsbm.bunmart.cart.services.CartService;
import com.nsbm.bunmart.cart.v1.*;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

@Slf4j
@GrpcService
public class GrpcController extends CartServiceGrpc.CartServiceImplBase {

    private final CartService cartService;
    private final GRPCMapper grpcMapper;

    public GrpcController(CartService cartService, GRPCMapper grpcMapper) {
        this.cartService = cartService;
        this.grpcMapper = grpcMapper;
    }

    @Override
    public void getCart(GetCartRequest request, StreamObserver<GetCartResponse> responseObserver) {
        String userId = request.getUserId();
        com.nsbm.bunmart.cart.model.Cart cart = cartService.getCart(userId);
        responseObserver.onNext(grpcMapper.CartToGetCartResponse(cart));
        responseObserver.onCompleted();
    }

    @Override
    public void addCartItem(AddCartItemRequest request, StreamObserver<AddCartItemResponse> responseObserver) {
        com.nsbm.bunmart.cart.model.Cart cart = cartService.addCartItem(request.getUserId(), request.getProductId(), request.getQuantity());
        responseObserver.onNext(grpcMapper.cartToAddCartItemResponse(cart));
        responseObserver.onCompleted();
    }

    @Override
    public void invalidateCart(InvalidateCartRequest request, StreamObserver<InvalidateCartResponse> responseObserver) {
        cartService.RemoveCartItems(request.getUserId(), request.getProductIdsList());
        responseObserver.onNext(InvalidateCartResponse.newBuilder().setInvalidated(true).build());
        responseObserver.onCompleted();
    }
}
