package com.nsbm.bunmart.userAuthentication.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {

    private String token;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String message;
}
