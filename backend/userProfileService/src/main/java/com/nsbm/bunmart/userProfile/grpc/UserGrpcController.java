package com.nsbm.bunmart.userProfile.grpc;

import com.nsbm.bunmart.userProfile.mappers.grpc.GrpcUserMapper;
import com.nsbm.bunmart.userProfile.model.Address;
import com.nsbm.bunmart.userProfile.model.User;
import com.nsbm.bunmart.userProfile.services.UserService;
import com.nsbm.bunmart.user.v1.*;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

import java.util.List;

@Slf4j
@GrpcService
public class UserGrpcController extends UserServiceGrpc.UserServiceImplBase {

    private final UserService userService;
    private final GrpcUserMapper grpcUserMapper;

    public UserGrpcController(UserService userService, GrpcUserMapper grpcUserMapper) {
        this.userService = userService;
        this.grpcUserMapper = grpcUserMapper;
    }

    @Override
    public void getUser(GetUserRequest request, StreamObserver<GetUserResponse> responseObserver) {
        String userId = request.getUserId();
        log.info("gRPC GetUser called for userId: {}", userId);

        User user = userService.getUserById(userId);
        responseObserver.onNext(grpcUserMapper.userToGetUserResponse(user));
        responseObserver.onCompleted();
    }

    @Override
    public void getUserAddresses(GetUserAddressesRequest request, StreamObserver<GetUserAddressesResponse> responseObserver) {
        String userId = request.getUserId();
        log.info("gRPC GetUserAddresses called for userId: {}", userId);

        List<Address> addresses = userService.getUserAddresses(userId);
        responseObserver.onNext(grpcUserMapper.addressesToGetUserAddressesResponse(addresses));
        responseObserver.onCompleted();
    }

    @Override
    public void validateUser(ValidateUserRequest request, StreamObserver<ValidateUserResponse> responseObserver) {
        String userId = request.getUserId();
        log.info("gRPC ValidateUser called for userId: {}", userId);

        boolean valid = userService.isUserValid(userId);
        User user = null;
        if (valid) {
            user = userService.getUserById(userId);
        }

        responseObserver.onNext(grpcUserMapper.userToValidateUserResponse(user, valid));
        responseObserver.onCompleted();
    }
}
