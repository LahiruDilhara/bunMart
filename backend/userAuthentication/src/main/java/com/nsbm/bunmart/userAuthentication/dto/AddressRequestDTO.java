package com.nsbm.bunmart.userAuthentication.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequestDTO {

    @NotBlank
    private String type; // DELIVERY, BILLING

    @NotBlank
    private String street;

    @NotBlank
    private String city;

    private String state;

    @NotBlank
    private String postalCode;

    @NotBlank
    private String country;
}
