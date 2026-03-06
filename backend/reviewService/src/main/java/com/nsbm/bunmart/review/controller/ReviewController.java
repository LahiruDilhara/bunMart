package com.nsbm.bunmart.review.controller;

import com.nsbm.bunmart.review.dto.CreateReviewRequestDTO;
import com.nsbm.bunmart.review.dto.ReviewResponseDTO;
import com.nsbm.bunmart.review.dto.UpdateReviewRequestDTO;
import com.nsbm.bunmart.review.mappers.rest.ReviewMapper;
import com.nsbm.bunmart.review.model.Review;
import com.nsbm.bunmart.review.services.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final ReviewMapper reviewMapper;

    @PostMapping
    public ResponseEntity<ReviewResponseDTO> create(@Valid @RequestBody CreateReviewRequestDTO dto) {
        Review r = reviewService.create(dto.getProductId(), dto.getUserId(), dto.getComment());
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewMapper.toReviewResponseDTO(r));
    }

    @GetMapping
    public List<ReviewResponseDTO> getAll() {
        return reviewService.getAll().stream()
                .map(reviewMapper::toReviewResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewResponseDTO> getById(@PathVariable Long id) {
        Review r = reviewService.getById(id);
        return ResponseEntity.ok(reviewMapper.toReviewResponseDTO(r));
    }

    @GetMapping("/product/{productId}")
    public List<ReviewResponseDTO> getByProductId(@PathVariable String productId) {
        return reviewService.getByProductId(productId).stream()
                .map(reviewMapper::toReviewResponseDTO)
                .collect(Collectors.toList());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReviewResponseDTO> update(@PathVariable Long id, @Valid @RequestBody UpdateReviewRequestDTO dto) {
        Review r = reviewService.update(id, dto.getComment());
        return ResponseEntity.ok(reviewMapper.toReviewResponseDTO(r));
    }

    @PatchMapping("/{id}/like")
    public ResponseEntity<ReviewResponseDTO> addLike(@PathVariable Long id) {
        Review r = reviewService.addLike(id);
        return ResponseEntity.ok(reviewMapper.toReviewResponseDTO(r));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reviewService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
