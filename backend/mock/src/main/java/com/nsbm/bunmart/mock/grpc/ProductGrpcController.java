package com.nsbm.bunmart.mock.grpc;

import com.google.protobuf.Timestamp;
import com.nsbm.bunmart.product.v1.*;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

import java.time.Instant;

@Slf4j
@GrpcService
public class ProductGrpcController extends ProductCatalogServiceGrpc.ProductCatalogServiceImplBase {

    private static Timestamp now() {
        return Timestamp.newBuilder().setSeconds(Instant.now().getEpochSecond()).build();
    }

    @Override
    public void getProduct(GetProductRequest request, StreamObserver<GetProductResponse> responseObserver) {
        ProductInfo product = ProductInfo.newBuilder()
                .setProductId(request.getProductId())
                .setName("Mock Product " + request.getProductId())
                .setDescription("Mock product description")
                .setCategoryId("cat-1")
                .addTagIds("tag-1")
                .setImageUrl("/images/mock-product.png")
                .addImageUrls("/images/mock-product.png")
                .setCreatedAt(now())
                .setUpdatedAt(now())
                .build();
        responseObserver.onNext(GetProductResponse.newBuilder().setProduct(product).build());
        responseObserver.onCompleted();
        log.debug("getProduct: productId={}", request.getProductId());
    }

    @Override
    public void getProducts(GetProductsRequest request, StreamObserver<GetProductsResponse> responseObserver) {
        GetProductsResponse.Builder builder = GetProductsResponse.newBuilder();
        for (String productId : request.getProductIdsList()) {
            builder.addProducts(ProductInfo.newBuilder()
                    .setProductId(productId)
                    .setName("Mock Product " + productId)
                    .setDescription("Mock product description")
                    .setCategoryId("cat-1")
                    .addTagIds("tag-1")
                    .setImageUrl("/images/mock-product.png")
                    .addImageUrls("/images/mock-product.png")
                    .setCreatedAt(now())
                    .setUpdatedAt(now())
                    .build());
        }
        responseObserver.onNext(builder.build());
        responseObserver.onCompleted();
        log.debug("getProducts: productIds={}", request.getProductIdsList());
    }

    @Override
    public void validateProducts(ValidateProductsRequest request, StreamObserver<ValidateProductsResponse> responseObserver) {
        responseObserver.onNext(ValidateProductsResponse.newBuilder()
                .addAllValidProductIds(request.getProductIdsList())
                .build());
        responseObserver.onCompleted();
        log.debug("validateProducts: productIds={}", request.getProductIdsList());
    }
}
