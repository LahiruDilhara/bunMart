package com.nsbm.bunmart.product.controller;

import com.nsbm.bunmart.product.dto.AddProductRequestDTO;
import com.nsbm.bunmart.product.dto.ImageResponseDTO;
import com.nsbm.bunmart.product.dto.ProductResponseDTO;
import com.nsbm.bunmart.product.dto.UpdateImageRequestDTO;
import com.nsbm.bunmart.product.dto.UpdateProductRequestDTO;
import com.nsbm.bunmart.product.errors.InvalidImageException;
import com.nsbm.bunmart.product.mappers.rest.ProductMapper;
import com.nsbm.bunmart.product.model.Product;
import com.nsbm.bunmart.product.services.ProductService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;
    private final ProductMapper productMapper;

    public ProductController(ProductService productService, ProductMapper productMapper) {
        this.productService = productService;
        this.productMapper = productMapper;
    }

    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getProducts(
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false, defaultValue = "false") Boolean availableOnly,
            @RequestParam(required = false) String sort) {
        Sort sortObj = parseSort(sort);
        List<Product> products;
        if (categoryId != null) {
            products = productService.getProductsByCategory(categoryId, sortObj);
        } else if (Boolean.TRUE.equals(availableOnly)) {
            products = productService.getProductsAvailable(sortObj);
        } else {
            products = productService.getProducts(sortObj);
        }
        List<ProductResponseDTO> dtos = products.stream()
                .map(productMapper::productToProductResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping()
    public ResponseEntity<ProductResponseDTO> addProduct(@Valid @RequestBody AddProductRequestDTO request) {
        if (request.getImageBase64() == null || request.getImageBase64().isBlank()) {
            throw new InvalidImageException("Image is required (base64 encoded)");
        }
        List<String> tags = request.getTags() != null ? request.getTags() : List.of();
        Product product = productService.addProduct(
                request.getCategoryId(),
                request.getName(),
                request.getImageBase64(),
                request.getDescription(),
                tags,
                request.getWeight(),
                request.getAvailability());
        return ResponseEntity.status(HttpStatus.CREATED).body(productMapper.productToProductResponseDTO(product));
    }

    @PutMapping("/{productId}")
    public ResponseEntity<ProductResponseDTO> updateProduct(
            @PathVariable String productId,
            @RequestBody UpdateProductRequestDTO request) {
        List<String> tags = request != null && request.getTags() != null ? request.getTags() : null;
        Product product = productService.updateProductDetails(
                productId,
                request != null ? request.getName() : null,
                request != null ? request.getDescription() : null,
                tags,
                request != null ? request.getWeight() : null,
                request != null ? request.getAvailability() : null,
                request != null ? request.getCategoryId() : null);
        return ResponseEntity.ok(productMapper.productToProductResponseDTO(product));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String productId) {
        productService.deleteProduct(productId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{productId}/image")
    public ResponseEntity<ProductResponseDTO> updateImage(
            @PathVariable String productId,
            @RequestBody UpdateImageRequestDTO request) {
        if (request == null || request.getImageBase64() == null || request.getImageBase64().isBlank()) {
            throw new InvalidImageException("Image is required (base64 encoded)");
        }
        Product product = productService.updateImage(productId, request.getImageBase64());
        return ResponseEntity.ok(productMapper.productToProductResponseDTO(product));
    }

    @GetMapping("/{productId}/image")
    public ResponseEntity<ImageResponseDTO> getProductImage(@PathVariable String productId) {
        Product product = productService.getProduct(productId);
        ImageResponseDTO imageResponse = productMapper.productToImageResponseDTO(product);
        if (imageResponse == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(imageResponse);
    }

    private static Sort parseSort(String sortParam) {
        if (sortParam == null || sortParam.isBlank()) {
            return Sort.unsorted();
        }
        String[] parts = sortParam.trim().split(",");
        if (parts.length == 1) {
            return Sort.by(Sort.Direction.ASC, parts[0].trim());
        }
        if (parts.length >= 2) {
            Sort.Direction direction = "desc".equalsIgnoreCase(parts[1].trim())
                    ? Sort.Direction.DESC
                    : Sort.Direction.ASC;
            return Sort.by(direction, parts[0].trim());
        }
        return Sort.unsorted();
    }
}
