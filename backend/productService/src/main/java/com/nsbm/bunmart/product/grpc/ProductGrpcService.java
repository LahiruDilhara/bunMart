package com.nsbm.bunmart.product.grpc;

import com.nsbm.bunmart.product.v1.*;
import com.nsbm.bunmart.product.service.ProductService;
import com.nsbm.bunmart.product.dto.ProductDTO;
import com.google.protobuf.Timestamp;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

import java.time.ZoneOffset;
import java.util.List;

/**
 * gRPC implementation of ProductCatalogService (defined in product.proto).
 * Consumed by: CartService, OrderManagementService, ReviewService, PricingService.
 */
@GrpcService
@RequiredArgsConstructor
@Slf4j
public class ProductGrpcService extends ProductCatalogServiceGrpc.ProductCatalogServiceImplBase {

    private final ProductService productService;

    // ── GetProduct ────────────────────────────────────────────────────────────

    @Override
    public void getProduct(GetProductRequest request,
                           StreamObserver<GetProductResponse> responseObserver) {
        log.info("[gRPC] GetProduct: {}", request.getProductId());
        try {
            ProductDTO.ProductResponse product = productService.getProduct(request.getProductId());
            GetProductResponse response = GetProductResponse.newBuilder()
                    .setProduct(toProto(product))
                    .build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("[gRPC] GetProduct error", e);
            responseObserver.onError(io.grpc.Status.NOT_FOUND
                    .withDescription(e.getMessage())
                    .asRuntimeException());
        }
    }

    // ── GetProducts ───────────────────────────────────────────────────────────

    @Override
    public void getProducts(GetProductsRequest request,
                            StreamObserver<GetProductsResponse> responseObserver) {
        log.info("[gRPC] GetProducts: {} ids", request.getProductIdsList().size());
        try {
            ProductDTO.ProductListResponse result = productService.getProducts(request.getProductIdsList());
            GetProductsResponse.Builder builder = GetProductsResponse.newBuilder();
            result.getProducts().forEach(p -> builder.addProducts(toProto(p)));
            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("[gRPC] GetProducts error", e);
            responseObserver.onError(io.grpc.Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asRuntimeException());
        }
    }

    // ── ValidateProducts ──────────────────────────────────────────────────────

    @Override
    public void validateProducts(ValidateProductsRequest request,
                                 StreamObserver<ValidateProductsResponse> responseObserver) {
        log.info("[gRPC] ValidateProducts: {} ids", request.getProductIdsList().size());
        try {
            ProductDTO.ValidateProductsResponse result =
                    productService.validateProducts(request.getProductIdsList());

            ValidateProductsResponse response = ValidateProductsResponse.newBuilder()
                    .addAllValidProductIds(result.getValidProductIds())
                    .build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("[gRPC] ValidateProducts error", e);
            responseObserver.onError(io.grpc.Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asRuntimeException());
        }
    }

    // ── Helper: DTO → Proto ───────────────────────────────────────────────────

    private ProductInfo toProto(ProductDTO.ProductResponse dto) {
        ProductInfo.Builder builder = ProductInfo.newBuilder()
                .setProductId(dto.getProductId())
                .setName(dto.getName())
                .setCategoryId(dto.getCategoryId());

        if (dto.getDescription() != null) builder.setDescription(dto.getDescription());
        if (dto.getImageUrl() != null)    builder.setImageUrl(dto.getImageUrl());
        if (dto.getTagIds() != null)      builder.addAllTagIds(dto.getTagIds());
        if (dto.getImageUrls() != null)   builder.addAllImageUrls(dto.getImageUrls());

        if (dto.getCreatedAt() != null) {
            builder.setCreatedAt(Timestamp.newBuilder()
                    .setSeconds(dto.getCreatedAt().toEpochSecond(ZoneOffset.UTC)).build());
        }
        if (dto.getUpdatedAt() != null) {
            builder.setUpdatedAt(Timestamp.newBuilder()
                    .setSeconds(dto.getUpdatedAt().toEpochSecond(ZoneOffset.UTC)).build());
        }
        return builder.build();
    }
}
