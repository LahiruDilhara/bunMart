package com.nsbm.bunmart.cart.grpc;

import com.nsbm.bunmart.cart.errors.CartNotExists;
import com.nsbm.bunmart.cart.errors.DatabaseException;
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
    private final GRPCMapper  grpcMapper;

    public  GrpcController(CartService cartService, GRPCMapper grpcMapper) {
        this.cartService = cartService;
        this.grpcMapper = grpcMapper;
    }

    @Override
    public void getCart(GetCartRequest request, StreamObserver<GetCartResponse> responseObserver) {
        String userId = request.getUserId();
        try{
            com.nsbm.bunmart.cart.model.Cart cart = cartService.getCart(userId);
            responseObserver.onNext(grpcMapper.CartToGetCartResponse(cart));
            responseObserver.onCompleted();
        }
        catch (CartNotExists cartNotExists){
            log.error("Cart not exists for userId:{}",userId,cartNotExists);
            responseObserver.onError(Status.INTERNAL.withDescription("Cart not exists").asRuntimeException());
            return;
        }
        catch (Exception e){
            log.error("Error occurred while get cart for userId:{}",userId,e);
            responseObserver.onError(Status.INTERNAL.withDescription("System error").asRuntimeException());
        }
    }

    @Override
    public void addCartItem(AddCartItemRequest request, StreamObserver<AddCartItemResponse> responseObserver) {
        try{
            com.nsbm.bunmart.cart.model.Cart cart = cartService.addCartItem(request.getUserId(),request.getProductId(),request.getQuantity());
            responseObserver.onNext(grpcMapper.cartToAddCartItemResponse(cart));
            responseObserver.onCompleted();
            return;
        }
        catch(CartNotExists e){
            log.error(e.getMessage());
            responseObserver.onError(Status.INTERNAL.withDescription("Cart not exists").asRuntimeException());
            return;
        }
        catch(DatabaseException e){
            log.error(e.getMessage());
            responseObserver.onError(Status.INTERNAL.withDescription("System error").asRuntimeException());
        }
        catch (Exception e) {
            log.error("addCartItem error",e);
            responseObserver.onError(Status.INTERNAL.withDescription("System error").asRuntimeException());
        }
    }

    @Override
    public void invalidateCart(InvalidateCartRequest request, StreamObserver<InvalidateCartResponse> responseObserver) {
        try{
            cartService.RemoveCartItems(request.getUserId(),request.getProductIdsList());
            responseObserver.onNext(InvalidateCartResponse.newBuilder().setInvalidated(true).build());
            responseObserver.onCompleted();
        }
        catch(CartNotExists e){
            log.error(e.getMessage());
            responseObserver.onError(Status.INTERNAL.withDescription("Cart not exists").asRuntimeException());
        }
        catch(DatabaseException e){
            log.error(e.getMessage());
            responseObserver.onError(Status.INTERNAL.withDescription("System error").asRuntimeException());
        }
        catch (Exception e) {
            log.error("invalidateCart error",e);
            responseObserver.onError(Status.INTERNAL.withDescription("System error").asRuntimeException());
        }
    }
}
