package com.nsbm.bunmart.review.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReviewRequestDTO {
    @NotBlank(message = "Product ID is required")
    private String productId;
    @NotBlank(message = "User ID is required")
    private String userId;
    private String comment;
}
