package com.nsbm.bunmart.product.controller;

import com.nsbm.bunmart.product.dto.ProductDTO;
import com.nsbm.bunmart.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // ── GET /api/v1/products ──────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<ProductDTO.ProductListResponse> getAllProducts(
            @RequestParam(required = false) String categoryId) {

        if (categoryId != null) {
            return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
        }
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // ── GET /api/v1/products/{productId} ─────────────────────────────────────
    @GetMapping("/{productId}")
    public ResponseEntity<ProductDTO.ProductResponse> getProduct(
            @PathVariable String productId) {
        return ResponseEntity.ok(productService.getProduct(productId));
    }

    // ── POST /api/v1/products/batch ───────────────────────────────────────────
    // Matches GetProducts RPC — accepts a list of IDs, returns multiple products
    @PostMapping("/batch")
    public ResponseEntity<ProductDTO.ProductListResponse> getProducts(
            @RequestBody List<String> productIds) {
        return ResponseEntity.ok(productService.getProducts(productIds));
    }

    // ── POST /api/v1/products/validate ────────────────────────────────────────
    // Matches ValidateProducts RPC
    @PostMapping("/validate")
    public ResponseEntity<ProductDTO.ValidateProductsResponse> validateProducts(
            @RequestBody List<String> productIds) {
        return ResponseEntity.ok(productService.validateProducts(productIds));
    }

    // ── POST /api/v1/products ─────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<ProductDTO.ProductResponse> createProduct(
            @RequestBody ProductDTO.CreateProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.createProduct(request));
    }

    // ── PUT /api/v1/products/{productId} ─────────────────────────────────────
    @PutMapping("/{productId}")
    public ResponseEntity<ProductDTO.ProductResponse> updateProduct(
            @PathVariable String productId,
            @RequestBody ProductDTO.UpdateProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(productId, request));
    }

    // ── DELETE /api/v1/products/{productId} ──────────────────────────────────
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String productId) {
        productService.deleteProduct(productId);
        return ResponseEntity.noContent().build();
    }
}
