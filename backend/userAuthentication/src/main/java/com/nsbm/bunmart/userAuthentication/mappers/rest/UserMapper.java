package com.nsbm.bunmart.userAuthentication.mappers.rest;

import com.nsbm.bunmart.userAuthentication.dto.AddressResponseDTO;
import com.nsbm.bunmart.userAuthentication.dto.UserListItemDTO;
import com.nsbm.bunmart.userAuthentication.dto.UserProfileResponseDTO;
import com.nsbm.bunmart.userAuthentication.model.Address;
import com.nsbm.bunmart.userAuthentication.model.User;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UserMapper {

    public UserProfileResponseDTO toUserProfileResponseDTO(User user) {
        return toUserProfileResponseDTO(user, user.getAddresses());
    }

    public UserProfileResponseDTO toUserProfileResponseDTO(User user, List<Address> addresses) {
        UserProfileResponseDTO dto = new UserProfileResponseDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setBlocked(user.isBlocked());

        List<AddressResponseDTO> addressDtos = addresses.stream()
                .map(this::toAddressResponseDTO)
                .toList();
        dto.setAddresses(addressDtos);

        return dto;
    }

    public UserListItemDTO toUserListItemDTO(User user) {
        UserListItemDTO dto = new UserListItemDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setRole(user.getRole());
        dto.setBlocked(user.isBlocked());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }

    public AddressResponseDTO toAddressResponseDTO(Address address) {
        AddressResponseDTO dto = new AddressResponseDTO();
        dto.setId(address.getId());
        dto.setType(address.getType());
        dto.setStreet(address.getStreet());
        dto.setCity(address.getCity());
        dto.setState(address.getState());
        dto.setPostalCode(address.getPostalCode());
        dto.setCountry(address.getCountry());
        dto.setCreatedAt(address.getCreatedAt());
        dto.setUpdatedAt(address.getUpdatedAt());
        return dto;
    }
}
