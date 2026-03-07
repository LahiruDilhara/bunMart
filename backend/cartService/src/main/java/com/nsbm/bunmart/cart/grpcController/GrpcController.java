package com.nsbm.bunmart.cart.grpcController;

import com.nsbm.bunmart.cart.mappers.grpc.GRPCMapper;
import com.nsbm.bunmart.cart.model.Cart;
import com.nsbm.bunmart.cart.services.CartService;
import com.nsbm.bunmart.cart.v1.*;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

import java.util.List;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class GrpcController extends CartServiceGrpc.CartServiceImplBase {

    private final CartService cartService;
    private final GRPCMapper grpcMapper;

    @Override
    public void getCart(GetCartRequest request, StreamObserver<GetCartResponse> responseObserver) {
        try {
            Cart cart = cartService.getCart(request.getUserId());
            GetCartResponse response = grpcMapper.toGetCartResponse(cart);
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void removeCartItems(RemoveCartItemsRequest request, StreamObserver<RemoveCartItemsResponse> responseObserver) {
        try {
            List<String> productIds = request.getProductIdsList();
            cartService.RemoveCartItems(request.getUserId(), productIds);
            RemoveCartItemsResponse response = RemoveCartItemsResponse.newBuilder().setRemoved(true).build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            responseObserver.onError(e);
        }
    }
}