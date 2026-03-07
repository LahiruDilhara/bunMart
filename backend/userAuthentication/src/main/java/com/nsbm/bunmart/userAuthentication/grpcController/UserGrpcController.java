package com.nsbm.bunmart.userAuthentication.grpcController;

import com.nsbm.bunmart.userAuthentication.mappers.grpc.GrpcUserMapper;
import com.nsbm.bunmart.userAuthentication.model.Address;
import com.nsbm.bunmart.userAuthentication.model.User;
import com.nsbm.bunmart.userAuthentication.services.UserService;
import com.nsbm.bunmart.user.v1.*;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

import java.util.List;

@Slf4j
@GrpcService
public class UserGrpcController extends UserServiceGrpc.UserServiceImplBase {

    private final UserService userService;
    private final GrpcUserMapper grpcMapper;

    public UserGrpcController(UserService userService, GrpcUserMapper grpcMapper) {
        this.userService = userService;
        this.grpcMapper = grpcMapper;
    }

    @Override
    public void getUser(GetUserRequest request, StreamObserver<GetUserResponse> responseObserver) {
        log.info("gRPC GetUser called for userId={}", request.getUserId());

        Long userId = Long.parseLong(request.getUserId());
        User user = userService.getUserById(userId);

        responseObserver.onNext(grpcMapper.toGetUserResponse(user));
        responseObserver.onCompleted();
    }

    @Override
    public void getUserAddresses(GetUserAddressesRequest request, StreamObserver<GetUserAddressesResponse> responseObserver) {
        log.info("gRPC GetUserAddresses called for userId={}", request.getUserId());

        Long userId = Long.parseLong(request.getUserId());
        User user = userService.getUserById(userId);
        List<Address> addresses = userService.getAddressesByUserId(userId);

        responseObserver.onNext(grpcMapper.toGetUserAddressesResponse(addresses));
        responseObserver.onCompleted();
    }

    @Override
    public void validateUser(ValidateUserRequest request, StreamObserver<ValidateUserResponse> responseObserver) {
        log.info("gRPC ValidateUser called for userId={}", request.getUserId());

        try {
            Long userId = Long.parseLong(request.getUserId());
            User user = userService.getUserById(userId);
            responseObserver.onNext(grpcMapper.toValidateUserResponse(user));
        } catch (Exception e) {
            log.warn("User not valid: {}", request.getUserId());
            responseObserver.onNext(grpcMapper.toInvalidUserResponse());
        }

        responseObserver.onCompleted();
    }
}