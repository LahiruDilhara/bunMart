package com.nsbm.bunmart.product.service;

import com.nsbm.bunmart.product.dto.ProductDTO;
import com.nsbm.bunmart.product.exception.ProductNotFoundException;
import com.nsbm.bunmart.product.mapper.ProductMapper;
import com.nsbm.bunmart.product.model.Product;
import com.nsbm.bunmart.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    // ── GetProduct ────────────────────────────────────────────────────────────

    @Override
    public ProductDTO.ProductResponse getProduct(String productId) {
        log.info("Fetching product: {}", productId);
        Product product = productRepository.findById(productId)
                .filter(p -> Boolean.TRUE.equals(p.getActive()))
                .orElseThrow(() -> new ProductNotFoundException(productId));
        return productMapper.toResponse(product);
    }

    // ── GetProducts ───────────────────────────────────────────────────────────

    @Override
    public ProductDTO.ProductListResponse getProducts(List<String> productIds) {
        log.info("Fetching {} products by IDs", productIds.size());
        List<ProductDTO.ProductResponse> products = productRepository
                .findAllByProductIdIn(productIds)
                .stream()
                .map(productMapper::toResponse)
                .collect(Collectors.toList());
        return ProductDTO.ProductListResponse.builder()
                .products(products)
                .total(products.size())
                .build();
    }

    // ── ValidateProducts ──────────────────────────────────────────────────────

    @Override
    public ProductDTO.ValidateProductsResponse validateProducts(List<String> productIds) {
        log.info("Validating {} product IDs", productIds.size());
        List<String> validIds = productRepository.findValidProductIds(productIds);
        List<String> invalidIds = new ArrayList<>(productIds);
        invalidIds.removeAll(validIds);
        return ProductDTO.ValidateProductsResponse.builder()
                .validProductIds(validIds)
                .invalidProductIds(invalidIds)
                .build();
    }

    // ── All Products ──────────────────────────────────────────────────────────

    @Override
    public ProductDTO.ProductListResponse getAllProducts() {
        log.info("Fetching all active products");
        List<ProductDTO.ProductResponse> products = productRepository.findByActiveTrue()
                .stream()
                .map(productMapper::toResponse)
                .collect(Collectors.toList());
        return ProductDTO.ProductListResponse.builder()
                .products(products)
                .total(products.size())
                .build();
    }

    // ── By Category ───────────────────────────────────────────────────────────

    @Override
    public ProductDTO.ProductListResponse getProductsByCategory(String categoryId) {
        log.info("Fetching products for category: {}", categoryId);
        List<ProductDTO.ProductResponse> products = productRepository
                .findByCategoryIdAndActiveTrue(categoryId)
                .stream()
                .map(productMapper::toResponse)
                .collect(Collectors.toList());
        return ProductDTO.ProductListResponse.builder()
                .products(products)
                .total(products.size())
                .build();
    }

    // ── Create ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ProductDTO.ProductResponse createProduct(ProductDTO.CreateProductRequest request) {
        log.info("Creating product: {}", request.getName());
        Product product = productMapper.toEntity(request);
        Product saved = productRepository.save(product);
        return productMapper.toResponse(saved);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ProductDTO.ProductResponse updateProduct(String productId, ProductDTO.UpdateProductRequest request) {
        log.info("Updating product: {}", productId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        if (request.getName() != null)        product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getCategoryId() != null)  product.setCategoryId(request.getCategoryId());
        if (request.getTagIds() != null)      product.setTagIds(request.getTagIds());
        if (request.getImageUrl() != null)    product.setImageUrl(request.getImageUrl());
        if (request.getImageUrls() != null)   product.setImageUrls(request.getImageUrls());
        if (request.getPrice() != null)       product.setPrice(request.getPrice());
        if (request.getStock() != null)       product.setStock(request.getStock());

        return productMapper.toResponse(productRepository.save(product));
    }

    // ── Soft Delete ───────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void deleteProduct(String productId) {
        log.info("Soft-deleting product: {}", productId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));
        product.setActive(false);
        productRepository.save(product);
    }
}
