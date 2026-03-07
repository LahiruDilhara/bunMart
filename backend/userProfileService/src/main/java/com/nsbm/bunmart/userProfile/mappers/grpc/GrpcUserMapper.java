package com.nsbm.bunmart.userProfile.mappers.grpc;

import com.nsbm.bunmart.userProfile.model.Address;
import com.nsbm.bunmart.userProfile.model.User;
import com.nsbm.bunmart.user.v1.AddressInfo;
import com.nsbm.bunmart.user.v1.GetUserAddressesResponse;
import com.nsbm.bunmart.user.v1.GetUserResponse;
import com.nsbm.bunmart.user.v1.UserInfo;
import com.nsbm.bunmart.user.v1.ValidateUserResponse;
import com.google.protobuf.Timestamp;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
public class GrpcUserMapper {

    public UserInfo userToUserInfo(User user) {
        if (user == null) return UserInfo.getDefaultInstance();
        UserInfo.Builder builder = UserInfo.newBuilder()
                .setUserId(String.valueOf(user.getId()))
                .setEmail(user.getEmail() != null ? user.getEmail() : "")
                .setDisplayName(user.getDisplayName() != null ? user.getDisplayName() : "")
                .setPhone(user.getPhone() != null ? user.getPhone() : "")
                .addAllRoles(user.getRoles() != null ? user.getRoles() : List.of())
                .setActive(user.isActive());
        if (user.getCreatedAt() != null) builder.setCreatedAt(toTimestamp(user.getCreatedAt()));
        if (user.getUpdatedAt() != null) builder.setUpdatedAt(toTimestamp(user.getUpdatedAt()));
        return builder.build();
    }

    public AddressInfo addressToAddressInfo(Address address) {
        if (address == null) return AddressInfo.getDefaultInstance();
        AddressInfo.Builder builder = AddressInfo.newBuilder()
                .setAddressId(String.valueOf(address.getId()))
                .setUserId(String.valueOf(address.getUserId()))
                .setLine1(address.getLine1() != null ? address.getLine1() : "")
                .setLine2(address.getLine2() != null ? address.getLine2() : "")
                .setCity(address.getCity() != null ? address.getCity() : "")
                .setState(address.getState() != null ? address.getState() : "")
                .setPostalCode(address.getPostalCode() != null ? address.getPostalCode() : "")
                .setCountry(address.getCountry() != null ? address.getCountry() : "")
                .setType(address.getType() != null ? address.getType() : "");
        if (address.getCreatedAt() != null) builder.setCreatedAt(toTimestamp(address.getCreatedAt()));
        if (address.getUpdatedAt() != null) builder.setUpdatedAt(toTimestamp(address.getUpdatedAt()));
        return builder.build();
    }

    public GetUserResponse userToGetUserResponse(User user) {
        return GetUserResponse.newBuilder()
                .setUser(userToUserInfo(user))
                .build();
    }

    public GetUserAddressesResponse addressesToGetUserAddressesResponse(List<Address> addresses) {
        GetUserAddressesResponse.Builder builder = GetUserAddressesResponse.newBuilder();
        for (Address address : addresses) {
            builder.addAddresses(addressToAddressInfo(address));
        }
        return builder.build();
    }

    public ValidateUserResponse userToValidateUserResponse(User user, boolean valid) {
        ValidateUserResponse.Builder builder = ValidateUserResponse.newBuilder()
                .setValid(valid);
        if (user != null) {
            builder.setUser(userToUserInfo(user));
        }
        return builder.build();
    }

    private static Timestamp toTimestamp(Instant instant) {
        return Timestamp.newBuilder()
                .setSeconds(instant.getEpochSecond())
                .setNanos(instant.getNano())
                .build();
    }
}
