package com.nsbm.bunmart.shipping.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "drivers")
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private Integer age;
    private String phone;

    @Column(nullable = false)
    private boolean active = true;

    private String vehicle;
    @Column(name = "cargo_size")
    private Integer cargoSize;
    @Column(name = "max_weight")
    private Double maxWeight;
}
