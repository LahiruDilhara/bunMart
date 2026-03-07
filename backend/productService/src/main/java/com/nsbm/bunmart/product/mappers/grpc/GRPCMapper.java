package com.nsbm.bunmart.product.mappers.grpc;

import com.nsbm.bunmart.product.model.Product;
import com.nsbm.bunmart.product.v1.GetProductResponse;
import com.nsbm.bunmart.product.v1.ProductInfo;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Maps between product domain models and product proto messages.
 */
@Component
public class GRPCMapper {

    public GetProductResponse toGetProductResponse(Product product) {
        return GetProductResponse.newBuilder()
                .setProduct(toProductInfo(product))
                .build();
    }

    public ProductInfo toProductInfo(Product product) {
        if (product == null) {
            return ProductInfo.getDefaultInstance();
        }
        String categoryId = product.getCategory() != null && product.getCategory().getId() != null
                ? String.valueOf(product.getCategory().getId())
                : "";
        List<String> tags = product.getTags() != null ? product.getTags() : List.of();
        boolean hasImage = product.getImageBase64() != null && !product.getImageBase64().isBlank();
        return ProductInfo.newBuilder()
                .setProductId(product.getId())
                .setName(product.getName() != null ? product.getName() : "")
                .setDescription(product.getDescription() != null ? product.getDescription() : "")
                .addAllTags(tags)
                .setWeight(product.getWeight() != null ? product.getWeight() : "")
                .setAvailability(Boolean.TRUE.equals(product.getAvailability()))
                .setCategoryId(categoryId)
                .setHasImage(hasImage)
                .build();
    }
}
