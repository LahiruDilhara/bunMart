package com.nsbm.bunmart.review.mappers.rest;

import com.nsbm.bunmart.review.dto.ReviewResponseDTO;
import com.nsbm.bunmart.review.model.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewResponseDTO toReviewResponseDTO(Review r) {
        if (r == null) return null;
        ReviewResponseDTO dto = new ReviewResponseDTO();
        dto.setId(r.getId());
        dto.setProductId(r.getProductId());
        dto.setUserId(r.getUserId());
        dto.setComment(r.getComment());
        dto.setLikeCount(r.getLikeCount());
        dto.setCreatedAt(r.getCreatedAt());
        dto.setUpdatedAt(r.getUpdatedAt());
        return dto;
    }
}
