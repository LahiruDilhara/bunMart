package com.nsbm.bunmart.userAuthentication.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequestDTO {

    private String firstName;
    private String lastName;
    private String phone;
}
