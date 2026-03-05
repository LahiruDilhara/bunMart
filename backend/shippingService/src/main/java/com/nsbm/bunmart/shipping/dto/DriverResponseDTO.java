package com.nsbm.bunmart.shipping.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverResponseDTO {
    private Integer id;
    private String fullName;
    private Integer age;
    private String phone;
    private boolean active;
    private String vehicle;
    private Integer cargoSize;
    private Double maxWeight;
}
