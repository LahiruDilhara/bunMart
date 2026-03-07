package com.nsbm.bunmart.userProfile.mappers.rest;

import com.nsbm.bunmart.userProfile.dto.AddressResponseDTO;
import com.nsbm.bunmart.userProfile.dto.ProfileAddressDTO;
import com.nsbm.bunmart.userProfile.dto.ProfileResponseDTO;
import com.nsbm.bunmart.userProfile.dto.UserResponseDTO;
import com.nsbm.bunmart.userProfile.model.Address;
import com.nsbm.bunmart.userProfile.model.User;
import org.springframework.stereotype.Component;

import java.util.List;

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

    public ProfileResponseDTO userToProfileResponseDTO(User user, List<Address> addresses) {
        String displayName = user.getDisplayName() != null ? user.getDisplayName() : "";
        String firstName = displayName;
        String lastName = "";
        int space = displayName.indexOf(' ');
        if (space > 0) {
            firstName = displayName.substring(0, space);
            lastName = displayName.substring(space + 1).trim();
        }
        String role = (user.getRoles() != null && !user.getRoles().isEmpty())
                ? user.getRoles().get(0) : "USER";
        List<ProfileAddressDTO> addrDtos = addresses.stream()
                .map(this::addressToProfileAddressDTO)
                .toList();
        return new ProfileResponseDTO(
                String.valueOf(user.getId()),
                firstName,
                lastName,
                user.getEmail(),
                user.getPhone(),
                role,
                addrDtos,
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    public ProfileAddressDTO addressToProfileAddressDTO(Address address) {
        String street = address.getLine1();
        if (address.getLine2() != null && !address.getLine2().isBlank()) {
            street = street + " " + address.getLine2();
        }
        return new ProfileAddressDTO(
                String.valueOf(address.getId()),
                address.getType(),
                street,
                address.getCity(),
                address.getState(),
                address.getPostalCode(),
                address.getCountry()
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
