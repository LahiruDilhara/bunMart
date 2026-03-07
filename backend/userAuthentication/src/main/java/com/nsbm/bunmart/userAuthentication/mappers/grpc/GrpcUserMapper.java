package com.nsbm.bunmart.userAuthentication.mappers.grpc;

import com.nsbm.bunmart.userAuthentication.model.Address;
import com.nsbm.bunmart.userAuthentication.model.User;
import com.nsbm.bunmart.user.v1.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class GrpcUserMapper {

    public UserInfo toUserInfo(User user) {
        if (user == null) return UserInfo.getDefaultInstance();
        return UserInfo.newBuilder()
                .setUserId(String.valueOf(user.getId()))
                .setEmail(user.getEmail() != null ? user.getEmail() : "")
                .setDisplayName(user.getFirstName() != null && user.getLastName() != null
                        ? (user.getFirstName() + " " + user.getLastName()).trim()
                        : (user.getFirstName() != null ? user.getFirstName() : ""))
                .setPhone(user.getPhone() != null ? user.getPhone() : "")
                .addAllRoles(user.getRole() != null ? List.of(user.getRole()) : List.of())
                .build();
    }

    public GetUserResponse toGetUserResponse(User user) {
        return GetUserResponse.newBuilder()
                .setUser(toUserInfo(user))
                .build();
    }

    public AddressInfo toAddressInfo(Address address) {
        if (address == null) return AddressInfo.getDefaultInstance();
        String userId = address.getUser() != null ? String.valueOf(address.getUser().getId()) : "";
        return AddressInfo.newBuilder()
                .setAddressId(String.valueOf(address.getId()))
                .setUserId(userId)
                .setLine1(address.getStreet())
                .setLine2("")
                .setCity(address.getCity())
                .setState(address.getState() != null ? address.getState() : "")
                .setPostalCode(address.getPostalCode())
                .setCountry(address.getCountry())
                .setType(address.getType())
                .build();
    }

    public GetUserAddressesResponse toGetUserAddressesResponse(List<Address> addresses) {
        GetUserAddressesResponse.Builder builder = GetUserAddressesResponse.newBuilder();
        for (Address address : addresses) {
            builder.addAddresses(toAddressInfo(address));
        }
        return builder.build();
    }

    public ValidateUserResponse toValidateUserResponse(User user) {
        return ValidateUserResponse.newBuilder()
                .setValid(true)
                .setUser(toUserInfo(user))
                .build();
    }

    public ValidateUserResponse toInvalidUserResponse() {
        return ValidateUserResponse.newBuilder()
                .setValid(false)
                .build();
    }
}