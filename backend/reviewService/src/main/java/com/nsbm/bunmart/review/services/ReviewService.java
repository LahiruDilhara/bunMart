package com.nsbm.bunmart.review.services;

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
