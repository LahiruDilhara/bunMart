package com.nsbm.bunmart.mock.grpc;

import com.nsbm.bunmart.user.v1.*;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

@Slf4j
@GrpcService
public class UserGrpcController extends UserServiceGrpc.UserServiceImplBase {

    @Override
    public void getUser(GetUserRequest request, StreamObserver<GetUserResponse> responseObserver) {
        UserInfo user = UserInfo.newBuilder()
                .setUserId(request.getUserId())
                .setEmail("mock@" + request.getUserId() + ".example.com")
                .setDisplayName("Mock User")
                .addRoles("CUSTOMER")
                .build();
        responseObserver.onNext(GetUserResponse.newBuilder().setUser(user).build());
        responseObserver.onCompleted();
        log.debug("getUser: userId={}", request.getUserId());
    }

    @Override
    public void getUserAddresses(GetUserAddressesRequest request, StreamObserver<GetUserAddressesResponse> responseObserver) {
        AddressInfo address = AddressInfo.newBuilder()
                .setAddressId("addr-mock-1")
                .setUserId(request.getUserId())
                .setLine1("123 Mock Street")
                .setCity("Mock City")
                .setState("MC")
                .setPostalCode("12345")
                .setCountry("US")
                .setType("SHIPPING")
                .build();
        responseObserver.onNext(GetUserAddressesResponse.newBuilder().addAddresses(address).build());
        responseObserver.onCompleted();
        log.debug("getUserAddresses: userId={}", request.getUserId());
    }

    @Override
    public void validateUser(ValidateUserRequest request, StreamObserver<ValidateUserResponse> responseObserver) {
        UserInfo user = UserInfo.newBuilder()
                .setUserId(request.getUserId())
                .setEmail("mock@" + request.getUserId() + ".example.com")
                .setDisplayName("Mock User")
                .addRoles("CUSTOMER")
                .build();
        responseObserver.onNext(ValidateUserResponse.newBuilder()
                .setValid(true)
                .setUser(user)
                .build());
        responseObserver.onCompleted();
        log.debug("validateUser: userId={}", request.getUserId());
    }
}
