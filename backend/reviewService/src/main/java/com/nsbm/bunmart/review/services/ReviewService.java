package com.nsbm.bunmart.review.services;

import com.nsbm.bunmart.review.dto.PaginatedReviewsDTO;
import com.nsbm.bunmart.review.dto.ProductRatingDTO;
import com.nsbm.bunmart.review.errors.ReviewNotFoundException;
import com.nsbm.bunmart.review.model.Review;
import com.nsbm.bunmart.review.repositories.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public Review create(String productId, String userId, String comment) {
        Review r = new Review();
        r.setProductId(productId);
        r.setUserId(userId);
        r.setComment(comment);
        r.setLikeCount(0);
        return reviewRepository.save(r);
    }

    public Review getById(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new ReviewNotFoundException("Review not found: " + id));
    }

    public List<Review> getByProductId(String productId) {
        return reviewRepository.findByProductId(productId);
    }

    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;

    /**
     * Returns a page of reviews for a product and the next page token (or empty if no more pages).
     */
    public PaginatedReviewsDTO getByProductIdPaginated(String productId, int pageSize, String pageToken) {
        List<Review> all = reviewRepository.findByProductId(productId);
        int size = Math.min(Math.max(pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
        int page = 0;
        try {
            if (pageToken != null && !pageToken.isBlank()) {
                page = Integer.parseInt(pageToken.trim());
            }
        } catch (NumberFormatException ignored) {
            page = 0;
        }
        page = Math.max(0, page);
        int from = page * size;
        int total = all.size();
        if (from >= total) {
            return new PaginatedReviewsDTO(List.of(), "");
        }
        int to = Math.min(from + size, total);
        List<Review> pageItems = all.subList(from, to);
        String nextToken = (from + size < total) ? String.valueOf(page + 1) : "";
        return new PaginatedReviewsDTO(pageItems, nextToken);
    }

    /**
     * Returns rating summary for a product. Entity has no rating field; averageRating is 0, totalCount is review count.
     */
    public ProductRatingDTO getProductRating(String productId) {
        List<Review> reviews = reviewRepository.findByProductId(productId);
        return new ProductRatingDTO(productId, 0.0, reviews.size());
    }

    public List<Review> getAll() {
        return reviewRepository.findAll();
    }

    public Review update(Long id, String comment) {
        Review r = getById(id);
        if (comment != null) r.setComment(comment);
        return reviewRepository.save(r);
    }

    public Review addLike(Long id) {
        Review r = getById(id);
        r.setLikeCount(r.getLikeCount() + 1);
        return reviewRepository.save(r);
    }

    public void delete(Long id) {
        Review r = getById(id);
        reviewRepository.delete(r);
    }
}
