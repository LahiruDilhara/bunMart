package com.nsbm.bunmart.review.mappers.grpc;

import com.nsbm.bunmart.review.dto.PaginatedReviewsDTO;
import com.nsbm.bunmart.review.dto.ProductRatingDTO;
import com.nsbm.bunmart.review.model.Review;
import com.nsbm.bunmart.review.v1.*;
import com.google.protobuf.Timestamp;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

/**
 * Maps between review domain models/DTOs and review proto messages.
 */
@Component
public class GRPCMapper {

    public GetReviewsResponse toGetReviewsResponse(PaginatedReviewsDTO dto) {
        List<ReviewInfo> infos = dto.getReviews() != null
                ? dto.getReviews().stream().map(this::toReviewInfo).toList()
                : List.of();
        return GetReviewsResponse.newBuilder()
                .addAllReviews(infos)
                .setNextPageToken(dto.getNextPageToken() != null ? dto.getNextPageToken() : "")
                .build();
    }

    public ReviewInfo toReviewInfo(Review review) {
        if (review == null) return ReviewInfo.getDefaultInstance();
        ReviewInfo.Builder builder = ReviewInfo.newBuilder()
                .setReviewId(String.valueOf(review.getId()))
                .setProductId(review.getProductId() != null ? review.getProductId() : "")
                .setUserId(review.getUserId() != null ? review.getUserId() : "")
                .setComment(review.getComment() != null ? review.getComment() : "")
                .setLikeCount(review.getLikeCount() != null ? review.getLikeCount() : 0);
        if (review.getCreatedAt() != null) builder.setCreatedAt(toTimestamp(review.getCreatedAt()));
        if (review.getUpdatedAt() != null) builder.setUpdatedAt(toTimestamp(review.getUpdatedAt()));
        return builder.build();
    }

    public GetProductRatingResponse toGetProductRatingResponse(ProductRatingDTO dto) {
        return GetProductRatingResponse.newBuilder()
                .setProductId(dto.getProductId() != null ? dto.getProductId() : "")
                .setAverageRating(dto.getAverageRating())
                .setTotalCount(dto.getTotalCount())
                .build();
    }

    private static Timestamp toTimestamp(LocalDateTime dateTime) {
        return Timestamp.newBuilder()
                .setSeconds(dateTime.toInstant(ZoneOffset.UTC).getEpochSecond())
                .setNanos(dateTime.getNano())
                .build();
    }
}
