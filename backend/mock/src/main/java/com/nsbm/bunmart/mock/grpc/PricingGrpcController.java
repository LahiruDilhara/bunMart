package com.nsbm.bunmart.mock.grpc;

import com.nsbm.bunmart.pricing.v1.*;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

@Slf4j
@GrpcService
public class PricingGrpcController extends PricingServiceGrpc.PricingServiceImplBase {

    @Override
    public void getPrices(GetPricesRequest request, StreamObserver<GetPricesResponse> responseObserver) {
        GetPricesResponse.Builder builder = GetPricesResponse.newBuilder();
        for (String productId : request.getProductIdsList()) {
            builder.addPrices(PriceInfo.newBuilder()
                    .setProductId(productId)
                    .setUnitPrice("4.99")
                    .setCurrencyCode("USD")
                    .build());
        }
        responseObserver.onNext(builder.build());
        responseObserver.onCompleted();
        log.debug("getPrices: productIds={}", request.getProductIdsList());
    }

    @Override
    public void getDiscounts(GetDiscountsRequest request, StreamObserver<GetDiscountsResponse> responseObserver) {
        GetDiscountsResponse response = GetDiscountsResponse.newBuilder().build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
        log.debug("getDiscounts: productIds={}, userId={}", request.getProductIdsList(), request.getUserId());
    }

    @Override
    public void calculatePrice(CalculatePriceRequest request, StreamObserver<CalculatePriceResponse> responseObserver) {
        String unitPrice = "4.99";
        double subtotal = 4.99 * request.getQuantity();
        responseObserver.onNext(CalculatePriceResponse.newBuilder()
                .setProductId(request.getProductId())
                .setQuantity(request.getQuantity())
                .setUnitPrice(unitPrice)
                .setSubtotal(String.format("%.2f", subtotal))
                .setDiscountAmount("0.00")
                .setDiscountDescription("")
                .setTotal(String.format("%.2f", subtotal))
                .setCurrencyCode("USD")
                .setCouponApplied(false)
                .build());
        responseObserver.onCompleted();
        log.debug("calculatePrice: productId={}, quantity={}", request.getProductId(), request.getQuantity());
    }

    @Override
    public void calculateOrderPricing(CalculateOrderPricingRequest request, StreamObserver<CalculateOrderPricingResponse> responseObserver) {
        CalculateOrderPricingResponse.Builder responseBuilder = CalculateOrderPricingResponse.newBuilder();
        double subtotal = 0.0;
        for (CalculateOrderPricingRequest.LineItem line : request.getItemsList()) {
            String unitPrice = "4.99";
            double lineTotal = 4.99 * line.getQuantity();
            subtotal += lineTotal;
            responseBuilder.addLines(CalculateOrderPricingResponse.LineResult.newBuilder()
                    .setProductId(line.getProductId())
                    .setQuantity(line.getQuantity())
                    .setUnitPrice(unitPrice)
                    .setLineTotal(String.format("%.2f", lineTotal))
                    .build());
        }
        responseBuilder.setSubtotal(String.format("%.2f", subtotal))
                .setDiscountTotal("0.00")
                .setTotal(String.format("%.2f", subtotal))
                .setCurrencyCode("USD");
        responseObserver.onNext(responseBuilder.build());
        responseObserver.onCompleted();
        log.debug("calculateOrderPricing: userId={}, itemsCount={}", request.getUserId(), request.getItemsList().size());
    }
}
