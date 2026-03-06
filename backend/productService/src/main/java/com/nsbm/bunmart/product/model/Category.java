package com.nsbm.bunmart.product.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "category_id", updatable = false, nullable = false)
    private String categoryId;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "sort_order")
    private Integer sortOrder;
}
