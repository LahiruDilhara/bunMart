package com.nsbm.bunmart.pricing.grpc;

import com.nsbm.bunmart.pricing.model.Coupon;
import com.nsbm.bunmart.pricing.model.DiscountRule;
import com.nsbm.bunmart.pricing.model.PriceRule;
import com.nsbm.bunmart.pricing.repositories.PriceRuleRepository;
import com.nsbm.bunmart.pricing.repositories.DiscountRuleRepository;
import com.nsbm.bunmart.pricing.repositories.CouponRepository;
import com.nsbm.bunmart.pricing.v1.*;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.server.service.GrpcService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@GrpcService
@RequiredArgsConstructor
public class PricingGrpcService extends PricingServiceGrpc.PricingServiceImplBase {

    private final PriceRuleRepository priceRuleRepo;
    private final DiscountRuleRepository discountRuleRepo;
    private final CouponRepository couponRepo;

    @Override
    public void getPrices(GetPricesRequest request, StreamObserver<GetPricesResponse> responseObserver) {
        List<PriceRule> rules = priceRuleRepo.findByProductIdInAndIsActiveTrue(request.getProductIdsList());
        List<PriceInfo> priceInfos = new ArrayList<>();
        for (PriceRule rule : rules) {
            priceInfos.add(PriceInfo.newBuilder()
                    .setProductId(rule.getProductId())
                    .setUnitPrice(rule.getUnitPrice().toPlainString())
                    .setCurrencyCode(rule.getCurrencyCode())
                    .build());
        }
        responseObserver.onNext(GetPricesResponse.newBuilder().addAllPrices(priceInfos).build());
        responseObserver.onCompleted();
    }

    @Override
    public void getDiscounts(GetDiscountsRequest request, StreamObserver<GetDiscountsResponse> responseObserver) {
        List<DiscountRule> rules = discountRuleRepo.findByProductIdInAndIsActiveTrue(request.getProductIdsList());
        List<DiscountInfo> discountInfos = new ArrayList<>();
        for (DiscountRule rule : rules) {
            discountInfos.add(DiscountInfo.newBuilder()
                    .setDiscountId(String.valueOf(rule.getId()))
                    .setProductId(rule.getProductId() != null ? rule.getProductId() : "")
                    .setType(rule.getType())
                    .setValue(rule.getValue().toPlainString())
                    .setDescription(rule.getDescription() != null ? rule.getDescription() : "")
                    .build());
        }
        responseObserver.onNext(GetDiscountsResponse.newBuilder().addAllDiscounts(discountInfos).build());
        responseObserver.onCompleted();
    }

    @Override
    public void calculatePrice(CalculatePriceRequest request, StreamObserver<CalculatePriceResponse> responseObserver) {
        Optional<PriceRule> priceRuleOpt = priceRuleRepo.findByProductIdAndIsActiveTrue(request.getProductId());
        if (priceRuleOpt.isEmpty()) {
            responseObserver.onError(io.grpc.Status.NOT_FOUND
                    .withDescription("Price not found for product: " + request.getProductId())
                    .asRuntimeException());
            return;
        }

        PriceRule priceRule = priceRuleOpt.get();
        BigDecimal unitPrice = priceRule.getUnitPrice();
        int quantity = request.getQuantity();
        BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));

        BigDecimal discountAmount = BigDecimal.ZERO;
        String discountDescription = "";
        boolean couponApplied = false;

        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            Optional<Coupon> couponOpt = couponRepo.findByCodeAndIsActiveTrue(request.getCouponCode());
            if (couponOpt.isPresent()) {
                Coupon coupon = couponOpt.get();
                discountAmount = computeDiscount(subtotal, coupon.getType(), coupon.getValue());
                discountDescription = coupon.getDescription() != null ? coupon.getDescription() : coupon.getCode();
                couponApplied = true;
            }
        }

        BigDecimal total = subtotal.subtract(discountAmount).max(BigDecimal.ZERO);

        responseObserver.onNext(CalculatePriceResponse.newBuilder()
                .setProductId(request.getProductId())
                .setQuantity(quantity)
                .setUnitPrice(unitPrice.toPlainString())
                .setSubtotal(subtotal.toPlainString())
                .setDiscountAmount(discountAmount.toPlainString())
                .setDiscountDescription(discountDescription)
                .setTotal(total.toPlainString())
                .setCurrencyCode(priceRule.getCurrencyCode())
                .setCouponApplied(couponApplied)
                .build());
        responseObserver.onCompleted();
    }

    @Override
    public void calculateOrderPricing(CalculateOrderPricingRequest request, StreamObserver<CalculateOrderPricingResponse> responseObserver) {
        List<CalculateOrderPricingResponse.LineResult> lineResults = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CalculateOrderPricingRequest.LineItem item : request.getItemsList()) {
            Optional<PriceRule> priceRuleOpt = priceRuleRepo.findByProductIdAndIsActiveTrue(item.getProductId());
            BigDecimal unitPrice = priceRuleOpt.map(PriceRule::getUnitPrice).orElse(BigDecimal.ZERO);
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            lineResults.add(CalculateOrderPricingResponse.LineResult.newBuilder()
                    .setProductId(item.getProductId())
                    .setQuantity(item.getQuantity())
                    .setUnitPrice(unitPrice.toPlainString())
                    .setLineTotal(lineTotal.toPlainString())
                    .build());
        }

        BigDecimal discountTotal = BigDecimal.ZERO;
        for (String couponCode : request.getCouponCodesList()) {
            Optional<Coupon> couponOpt = couponRepo.findByCodeAndIsActiveTrue(couponCode);
            if (couponOpt.isPresent()) {
                Coupon coupon = couponOpt.get();
                discountTotal = discountTotal.add(computeDiscount(subtotal, coupon.getType(), coupon.getValue()));
            }
        }

        BigDecimal total = subtotal.subtract(discountTotal).max(BigDecimal.ZERO);
        String currency = priceRuleRepo.findByProductIdAndIsActiveTrue(
                        request.getItemsCount() > 0 ? request.getItems(0).getProductId() : "")
                .map(PriceRule::getCurrencyCode).orElse("USD");

        responseObserver.onNext(CalculateOrderPricingResponse.newBuilder()
                .addAllLines(lineResults)
                .setSubtotal(subtotal.toPlainString())
                .setDiscountTotal(discountTotal.toPlainString())
                .setTotal(total.toPlainString())
                .setCurrencyCode(currency)
                .build());
        responseObserver.onCompleted();
    }

    private BigDecimal computeDiscount(BigDecimal amount, String type, BigDecimal value) {
        if ("PERCENTAGE".equalsIgnoreCase(type)) {
            return amount.multiply(value).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            return value.min(amount);
        }
    }
}