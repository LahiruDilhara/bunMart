package com.nsbm.bunmart.userAuthentication.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponseDTO {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String role;
    private List<AddressResponseDTO> addresses;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean blocked;
}
