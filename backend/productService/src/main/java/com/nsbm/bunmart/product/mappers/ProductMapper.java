package com.nsbm.bunmart.product.mapper;

import com.nsbm.bunmart.product.dto.ProductDTO;
import com.nsbm.bunmart.product.model.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public ProductDTO.ProductResponse toResponse(Product product) {
        return ProductDTO.ProductResponse.builder()
                .productId(product.getProductId())
                .name(product.getName())
                .description(product.getDescription())
                .categoryId(product.getCategoryId())
                .tagIds(product.getTagIds())
                .imageUrl(product.getImageUrl())
                .imageUrls(product.getImageUrls())
                .price(product.getPrice())
                .stock(product.getStock())
                .active(product.getActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    public Product toEntity(ProductDTO.CreateProductRequest request) {
        return Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .categoryId(request.getCategoryId())
                .tagIds(request.getTagIds() != null ? request.getTagIds() : new java.util.ArrayList<>())
                .imageUrl(request.getImageUrl())
                .imageUrls(request.getImageUrls() != null ? request.getImageUrls() : new java.util.ArrayList<>())
                .price(request.getPrice())
                .stock(request.getStock())
                .build();
    }
}
