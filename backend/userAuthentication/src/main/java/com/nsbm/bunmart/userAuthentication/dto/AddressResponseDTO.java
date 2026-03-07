package com.nsbm.bunmart.userAuthentication.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponseDTO {

    private Long id;
    private String type;
    private String street;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
