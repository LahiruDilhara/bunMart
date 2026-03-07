package com.nsbm.bunmart.pricing.grpc;

import com.nsbm.bunmart.pricing.dto.CalculatePriceRequestDTO;
import com.nsbm.bunmart.pricing.dto.CalculatePriceResponseDTO;
import com.nsbm.bunmart.pricing.mappers.grpc.GRPCMapper;
import com.nsbm.bunmart.pricing.model.Coupon;
import com.nsbm.bunmart.pricing.model.Product;
import com.nsbm.bunmart.pricing.services.CouponService;
import com.nsbm.bunmart.pricing.services.PricingCalculationService;
import com.nsbm.bunmart.pricing.services.ProductService;
import com.nsbm.bunmart.pricing.v1.*;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class GrpcController extends PricingServiceGrpc.PricingServiceImplBase {

    private final ProductService productService;
    private final PricingCalculationService pricingCalculationService;
    private final CouponService couponService;
    private final GRPCMapper grpcMapper;

    @Override
    public void getProductPrice(GetProductPriceRequest request, StreamObserver<GetProductPriceResponse> responseObserver) {
        Product product = productService.getById(request.getProductId());
        GetProductPriceResponse response = grpcMapper.toGetProductPriceResponse(product);
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void calculateOrderPricing(CalculateOrderPricingRequest request, StreamObserver<CalculateOrderPricingResponse> responseObserver) {
        CalculatePriceRequestDTO dto = grpcMapper.toCalculatePriceRequestDTO(request);
        List<String> productIds = dto.getItems().stream()
                .map(CalculatePriceRequestDTO.LineItemDTO::getProductId)
                .collect(Collectors.toList());
        List<Integer> quantities = dto.getItems().stream()
                .map(CalculatePriceRequestDTO.LineItemDTO::getQuantity)
                .collect(Collectors.toList());
        CalculatePriceResponseDTO result = pricingCalculationService.calculate(productIds, quantities, dto.getCouponCode());
        CalculateOrderPricingResponse response = grpcMapper.toCalculateOrderPricingResponse(result);
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void validateCoupon(ValidateCouponRequest request, StreamObserver<ValidateCouponResponse> responseObserver) {
        Optional<Coupon> couponOpt = couponService.findByCode(request.getCouponCode());
        boolean valid = couponOpt.isPresent();
        String discountAmount = couponOpt
                .map(c -> c.getValue() != null ? c.getValue().toPlainString() : "0")
                .orElse("0");
        ValidateCouponResponse response = grpcMapper.toValidateCouponResponse(valid, discountAmount);
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
