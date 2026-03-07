package com.nsbm.bunmart.review.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Product rating summary (e.g. for gRPC GetProductRating).
 * Entity has no rating field; averageRating can be 0 until a rating is added.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRatingDTO {
    private String productId;
    private double averageRating;
    private int totalCount;
}
