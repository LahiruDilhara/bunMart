package com.nsbm.bunmart.review.dto;

import com.nsbm.bunmart.review.model.Review;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Result of paginated get-reviews (e.g. for gRPC GetReviews).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaginatedReviewsDTO {
    private List<Review> reviews;
    private String nextPageToken;
}
