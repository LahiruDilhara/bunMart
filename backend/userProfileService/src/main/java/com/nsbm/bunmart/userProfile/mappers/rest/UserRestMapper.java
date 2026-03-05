package com.nsbm.bunmart.userProfile.mappers.rest;

import com.nsbm.bunmart.userProfile.dto.AddressResponseDTO;
import com.nsbm.bunmart.userProfile.dto.UserResponseDTO;
import com.nsbm.bunmart.userProfile.model.Address;
import com.nsbm.bunmart.userProfile.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserRestMapper {

    public UserResponseDTO userToUserResponseDTO(User user) {
        return new UserResponseDTO(
                String.valueOf(user.getId()),
                user.getEmail(),
                user.getDisplayName(),
                user.getPhone(),
                user.getRoles(),
                user.isActive(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    public AddressResponseDTO addressToAddressResponseDTO(Address address) {
        return new AddressResponseDTO(
                String.valueOf(address.getId()),
                String.valueOf(address.getUserId()),
                address.getLine1(),
                address.getLine2(),
                address.getCity(),
                address.getState(),
                address.getPostalCode(),
                address.getCountry(),
                address.getType(),
                address.getCreatedAt(),
                address.getUpdatedAt()
        );
    }
}