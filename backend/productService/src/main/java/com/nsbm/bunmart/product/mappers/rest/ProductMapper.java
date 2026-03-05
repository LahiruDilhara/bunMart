package com.nsbm.bunmart.product.mappers.rest;

import com.nsbm.bunmart.product.dto.ImageResponseDTO;
import com.nsbm.bunmart.product.dto.ProductResponseDTO;
import com.nsbm.bunmart.product.model.Product;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class ProductMapper {

    public ProductResponseDTO productToProductResponseDTO(Product product) {
        if (product == null) {
            return null;
        }
        Integer categoryId = product.getCategory() != null ? product.getCategory().getId() : null;
        boolean hasImage = product.getImageBase64() != null && !product.getImageBase64().isBlank();
        List<String> tags = product.getTags() != null ? product.getTags() : Collections.emptyList();
        return new ProductResponseDTO(
                product.getId(),
                product.getName(),
                product.getDescription(),
                tags,
                product.getWeight(),
                product.getAvailability(),
                categoryId,
                hasImage);
    }

    public ImageResponseDTO productToImageResponseDTO(Product product) {
        if (product == null) {
            return null;
        }
        String imageBase64 = product.getImageBase64();
        if (imageBase64 == null || imageBase64.isBlank()) {
            return null;
        }
        return new ImageResponseDTO(imageBase64);
    }
}
