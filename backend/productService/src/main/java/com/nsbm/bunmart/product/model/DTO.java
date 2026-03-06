package com.nsbm.bunmart.product.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class ProductDTO {

    // ── Request DTOs ─────────────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateProductRequest {
        private String name;
        private String description;
        private String categoryId;
        private List<String> tagIds;
        private String imageUrl;
        private List<String> imageUrls;
        private Double price;
        private Integer stock;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateProductRequest {
        private String name;
        private String description;
        private String categoryId;
        private List<String> tagIds;
        private String imageUrl;
        private List<String> imageUrls;
        private Double price;
        private Integer stock;
    }

    // ── Response DTOs ────────────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ProductResponse {
        private String productId;
        private String name;
        private String description;
        private String categoryId;
        private List<String> tagIds;
        private String imageUrl;
        private List<String> imageUrls;
        private Double price;
        private Integer stock;
        private Boolean active;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ProductListResponse {
        private List<ProductResponse> products;
        private int total;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ValidateProductsResponse {
        private List<String> validProductIds;
        private List<String> invalidProductIds;
    }
}
