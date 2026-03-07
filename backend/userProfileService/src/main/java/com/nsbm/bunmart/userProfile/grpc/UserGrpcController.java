package com.nsbm.bunmart.userProfile.grpc;

import com.nsbm.bunmart.userProfile.mappers.grpc.GrpcUserMapper;
import com.nsbm.bunmart.userProfile.model.Address;
import com.nsbm.bunmart.userProfile.model.User;
import com.nsbm.bunmart.userProfile.services.UserService;
import com.nsbm.bunmart.user.v1.*;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

import java.util.List;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class UserGrpcController extends UserServiceGrpc.UserServiceImplBase {

    private final UserService userService;
    private final GrpcUserMapper grpcUserMapper;

    @Override
    public void getUser(GetUserRequest request, StreamObserver<GetUserResponse> responseObserver) {
        User user = userService.getUserById(request.getUserId());
        GetUserResponse response = grpcUserMapper.userToGetUserResponse(user);
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void getUserAddresses(GetUserAddressesRequest request, StreamObserver<GetUserAddressesResponse> responseObserver) {
        List<Address> addresses = userService.getUserAddresses(request.getUserId());
        GetUserAddressesResponse response = grpcUserMapper.addressesToGetUserAddressesResponse(addresses);
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void validateUser(ValidateUserRequest request, StreamObserver<ValidateUserResponse> responseObserver) {
        boolean valid = userService.isUserValid(request.getUserId());
        User user = valid ? userService.getUserById(request.getUserId()) : null;
        ValidateUserResponse response = grpcUserMapper.userToValidateUserResponse(user, valid);
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
