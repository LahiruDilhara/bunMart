package com.nsbm.bunmart.product.grpc;

import com.nsbm.bunmart.product.mappers.grpc.GRPCMapper;
import com.nsbm.bunmart.product.model.Product;
import com.nsbm.bunmart.product.services.ProductService;
import com.nsbm.bunmart.product.v1.GetProductRequest;
import com.nsbm.bunmart.product.v1.GetProductResponse;
import com.nsbm.bunmart.product.v1.ProductCatalogServiceGrpc;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class GrpcController extends ProductCatalogServiceGrpc.ProductCatalogServiceImplBase {

    private final ProductService productService;
    private final GRPCMapper grpcMapper;

    @Override
    @Transactional(readOnly = true)
    public void getProduct(GetProductRequest request, StreamObserver<GetProductResponse> responseObserver) {
        Product product = productService.getProduct(request.getProductId());
        GetProductResponse response = grpcMapper.toGetProductResponse(product);
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
