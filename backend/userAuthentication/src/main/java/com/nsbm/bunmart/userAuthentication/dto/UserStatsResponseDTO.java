package com.nsbm.bunmart.userAuthentication.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsResponseDTO {

    private long total;
    private long blocked;
}
