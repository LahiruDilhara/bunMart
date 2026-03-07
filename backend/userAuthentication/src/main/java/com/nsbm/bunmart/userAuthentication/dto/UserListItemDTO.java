package com.nsbm.bunmart.userAuthentication.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserListItemDTO {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private boolean blocked;
    private LocalDateTime createdAt;
}
