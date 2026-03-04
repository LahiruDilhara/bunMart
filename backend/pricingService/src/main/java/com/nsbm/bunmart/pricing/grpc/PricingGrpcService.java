package com.nsbm.bunmart.pricing.grpc;

import com.nsbm.bunmart.pricing.model.*;
import com.nsbm.bunmart.pricing.repositories.*;
import com.nsbm.bunmart.pricing.v1.*;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class PricingGrpcService extends PricingServiceGrpc.PricingServiceImplBase {

    private final PriceRuleRepository priceRuleRepo;
    private final DiscountRuleRepository discountRuleRepo;
    private final CouponRepository couponRepo;
    private final CampaignRepository campaignRepo;
    private final UserRepository userRepo;

    @Override
    public void getPrices(GetPricesRequest request, StreamObserver<GetPricesResponse> responseObserver) {
        try {
            log.info("GetPrices request for products: {}", request.getProductIdsList());

            // Use the safe method that gets latest prices
            List<PriceRule> rules = priceRuleRepo.findLatestByProductIdInAndIsActiveTrue(request.getProductIdsList());

            List<PriceInfo> priceInfos = rules.stream()
                    .map(rule -> PriceInfo.newBuilder()
                            .setProductId(rule.getProductId())
                            .setUnitPrice(rule.getUnitPrice().toPlainString())
                            .setCurrencyCode(rule.getCurrencyCode() != null ? rule.getCurrencyCode() : "USD")
                            .build())
                    .collect(Collectors.toList());

            GetPricesResponse response = GetPricesResponse.newBuilder()
                    .addAllPrices(priceInfos)
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();

            log.info("GetPrices completed successfully, found {} prices", priceInfos.size());

        } catch (Exception e) {
            log.error("Error in getPrices", e);
            responseObserver.onError(io.grpc.Status.INTERNAL
                    .withDescription("Failed to get prices: " + e.getMessage())
                    .asRuntimeException());
        }
    }

    @Override
    public void getDiscounts(GetDiscountsRequest request, StreamObserver<GetDiscountsResponse> responseObserver) {
        try {
            log.info("GetDiscounts request for products: {}, userId: {}, couponCode: {}",
                    request.getProductIdsList(), request.getUserId(), request.getCouponCode());

            List<DiscountInfo> discountInfos = new ArrayList<>();
            Set<String> seenDiscountIds = new HashSet<>();
            LocalDateTime now = LocalDateTime.now();
            String userSegment = null;
            String loyaltyTier = null;

            // Get user information if provided
            if (request.getUserId() != null && !request.getUserId().isEmpty()) {
                Optional<User> userOpt = userRepo.findByUserId(request.getUserId());
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    userSegment = user.getUserSegment();
                    loyaltyTier = user.getLoyaltyTier();
                    log.info("User found: segment={}, tier={}", userSegment, loyaltyTier);
                }
            }

            // 1. Get product-specific discount rules
            List<DiscountRule> productDiscounts = discountRuleRepo.findByProductIdInAndIsActiveTrue(request.getProductIdsList());

            for (DiscountRule rule : productDiscounts) {
                if (rule != null && rule.getId() != null && !seenDiscountIds.contains("RULE_" + rule.getId())) {
                    // Check if this discount should be filtered for user segment
                    if (shouldIncludeDiscountForUser(rule, userSegment)) {
                        discountInfos.add(DiscountInfo.newBuilder()
                                .setDiscountId("RULE_" + rule.getId())
                                .setProductId(rule.getProductId() != null ? rule.getProductId() : "")
                                .setType(rule.getType() != null ? rule.getType() : "")
                                .setValue(rule.getValue() != null ? rule.getValue().toPlainString() : "0")
                                .setDescription(buildDiscountDescription(rule, null))
                                .build());
                        seenDiscountIds.add("RULE_" + rule.getId());
                    }
                }
            }

            // 2. Get campaign discounts
            for (String productId : request.getProductIdsList()) {
                List<Campaign> campaigns = campaignRepo.findActiveCampaignsByProductId(productId, now);
                for (Campaign campaign : campaigns) {
                    if (campaign != null && campaign.getDiscountRules() != null) {
                        for (DiscountRule rule : campaign.getDiscountRules()) {
                            if (rule != null && rule.getIsActive() != null && rule.getIsActive()
                                    && rule.getId() != null && !seenDiscountIds.contains("CAMPAIGN_" + campaign.getId() + "_" + rule.getId())) {

                                // Check if this discount should be filtered for user segment
                                if (shouldIncludeDiscountForUser(rule, userSegment)) {
                                    discountInfos.add(DiscountInfo.newBuilder()
                                            .setDiscountId("CAMPAIGN_" + campaign.getId() + "_" + rule.getId())
                                            .setProductId(rule.getProductId() != null ? rule.getProductId() : productId)
                                            .setType(rule.getType() != null ? rule.getType() : "")
                                            .setValue(rule.getValue() != null ? rule.getValue().toPlainString() : "0")
                                            .setDescription(buildDiscountDescription(rule, campaign))
                                            .build());
                                    seenDiscountIds.add("CAMPAIGN_" + campaign.getId() + "_" + rule.getId());
                                }
                            }
                        }
                    }
                }
            }

            // 3. Add user-specific loyalty discounts based on tier
            if (loyaltyTier != null) {
                String loyaltyDiscountId = "LOYALTY_" + loyaltyTier;
                if (!seenDiscountIds.contains(loyaltyDiscountId)) {
                    BigDecimal discountPercent = getLoyaltyDiscountPercent(loyaltyTier);
                    if (discountPercent.compareTo(BigDecimal.ZERO) > 0) {
                        discountInfos.add(DiscountInfo.newBuilder()
                                .setDiscountId(loyaltyDiscountId)
                                .setProductId("")  // Applies to all products
                                .setType("PERCENTAGE")
                                .setValue(discountPercent.toPlainString())
                                .setDescription(loyaltyTier + " loyalty member - " + discountPercent + "% off")
                                .build());
                        seenDiscountIds.add(loyaltyDiscountId);
                    }
                }
            }

            // 4. Add user-segment specific discounts
            if ("PREMIUM".equalsIgnoreCase(userSegment)) {
                String premiumDiscountId = "USER_PREMIUM";
                if (!seenDiscountIds.contains(premiumDiscountId)) {
                    discountInfos.add(DiscountInfo.newBuilder()
                            .setDiscountId(premiumDiscountId)
                            .setProductId("")  // Applies to all products
                            .setType("PERCENTAGE")
                            .setValue("5")
                            .setDescription("Premium member extra 5% off")
                            .build());
                    seenDiscountIds.add(premiumDiscountId);
                }
            }

            // 5. Add coupon as discount if provided (and valid)
            if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
                Optional<Coupon> couponOpt = couponRepo.findValidCouponByCode(request.getCouponCode(), now);
                if (couponOpt.isPresent()) {
                    Coupon coupon = couponOpt.get();
                    String couponDiscountId = "COUPON_" + coupon.getId();

                    // Check if coupon meets minimum order (if we had order amount, but here we don't)
                    // Just add it as available discount
                    if (!seenDiscountIds.contains(couponDiscountId)) {
                        discountInfos.add(DiscountInfo.newBuilder()
                                .setDiscountId(couponDiscountId)
                                .setProductId("")  // Coupon applies to entire order
                                .setType(coupon.getType() != null ? coupon.getType() : "")
                                .setValue(coupon.getValue() != null ? coupon.getValue().toPlainString() : "0")
                                .setDescription(buildCouponDescription(coupon))
                                .build());
                        seenDiscountIds.add(couponDiscountId);
                    }
                } else {
                    log.info("Coupon code {} is not valid or expired", request.getCouponCode());
                }
            }

            GetDiscountsResponse response = GetDiscountsResponse.newBuilder()
                    .addAllDiscounts(discountInfos)
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();

            log.info("GetDiscounts completed successfully, found {} discounts", discountInfos.size());

        } catch (Exception e) {
            log.error("Error in getDiscounts", e);
            responseObserver.onError(io.grpc.Status.INTERNAL
                    .withDescription("Failed to get discounts: " + e.getMessage())
                    .asRuntimeException());
        }
    }

    @Override
    public void calculatePrice(CalculatePriceRequest request, StreamObserver<CalculatePriceResponse> responseObserver) {
        try {
            log.info("CalculatePrice request: productId={}, quantity={}, couponCode={}, userId={}",
                    request.getProductId(), request.getQuantity(),
                    request.getCouponCode(), request.getUserId());

            // Validate quantity
            if (request.getQuantity() <= 0) {
                responseObserver.onError(io.grpc.Status.INVALID_ARGUMENT
                        .withDescription("Quantity must be positive")
                        .asRuntimeException());
                return;
            }

            // Use safe method that handles duplicates
            Optional<PriceRule> priceRuleOpt = priceRuleRepo.findActivePriceRule(request.getProductId());

            if (priceRuleOpt.isEmpty()) {
                String errorMsg = "Price not found for product: " + request.getProductId();
                log.warn(errorMsg);
                responseObserver.onError(io.grpc.Status.NOT_FOUND
                        .withDescription(errorMsg)
                        .asRuntimeException());
                return;
            }

            PriceRule priceRule = priceRuleOpt.get();
            log.info("Found price rule ID: {} with price: {}", priceRule.getId(), priceRule.getUnitPrice());

            // Calculate subtotal
            BigDecimal unitPrice = priceRule.getUnitPrice();
            int quantity = request.getQuantity();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));

            // Calculate discounts
            DiscountCalculationResult discountResult = calculateDiscounts(
                    request.getProductId(),
                    subtotal,
                    request.getCouponCode() != null ? request.getCouponCode() : "",
                    request.getUserId() != null ? request.getUserId() : ""
            );

            BigDecimal total = subtotal.subtract(discountResult.getTotalDiscount()).max(BigDecimal.ZERO);

            CalculatePriceResponse response = CalculatePriceResponse.newBuilder()
                    .setProductId(request.getProductId())
                    .setQuantity(quantity)
                    .setUnitPrice(unitPrice.toPlainString())
                    .setSubtotal(subtotal.toPlainString())
                    .setDiscountAmount(discountResult.getTotalDiscount().toPlainString())
                    .setDiscountDescription(discountResult.getDescription())
                    .setTotal(total.toPlainString())
                    .setCurrencyCode(priceRule.getCurrencyCode() != null ? priceRule.getCurrencyCode() : "USD")
                    .setCouponApplied(discountResult.isCouponApplied())
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();

            log.info("CalculatePrice completed successfully. Total: {}", total);

        } catch (Exception e) {
            log.error("Error in calculatePrice", e);
            responseObserver.onError(io.grpc.Status.INTERNAL
                    .withDescription("Internal error: " + e.getMessage())
                    .asRuntimeException());
        }
    }

    @Override
    public void calculateOrderPricing(CalculateOrderPricingRequest request,
                                      StreamObserver<CalculateOrderPricingResponse> responseObserver) {
        try {
            log.info("CalculateOrderPricing request with {} items, userId: {}, coupons: {}",
                    request.getItemsCount(), request.getUserId(), request.getCouponCodesList());

            List<CalculateOrderPricingResponse.LineResult> lineResults = new ArrayList<>();
            BigDecimal subtotal = BigDecimal.ZERO;
            String currency = "USD";

            // Calculate line items
            for (CalculateOrderPricingRequest.LineItem item : request.getItemsList()) {
                if (item.getQuantity() <= 0) {
                    responseObserver.onError(io.grpc.Status.INVALID_ARGUMENT
                            .withDescription("Quantity must be positive for product: " + item.getProductId())
                            .asRuntimeException());
                    return;
                }

                Optional<PriceRule> priceRuleOpt = priceRuleRepo.findActivePriceRule(item.getProductId());
                BigDecimal unitPrice = priceRuleOpt.map(PriceRule::getUnitPrice).orElse(BigDecimal.ZERO);
                BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                subtotal = subtotal.add(lineTotal);

                if (priceRuleOpt.isPresent() && priceRuleOpt.get().getCurrencyCode() != null) {
                    currency = priceRuleOpt.get().getCurrencyCode();
                }

                lineResults.add(CalculateOrderPricingResponse.LineResult.newBuilder()
                        .setProductId(item.getProductId())
                        .setQuantity(item.getQuantity())
                        .setUnitPrice(unitPrice.toPlainString())
                        .setLineTotal(lineTotal.toPlainString())
                        .build());
            }

            // Apply all coupons
            BigDecimal discountTotal = BigDecimal.ZERO;
            LocalDateTime now = LocalDateTime.now();
            List<String> appliedCoupons = new ArrayList<>();

            for (String couponCode : request.getCouponCodesList()) {
                if (couponCode != null && !couponCode.isEmpty()) {
                    Optional<Coupon> couponOpt = couponRepo.findValidCouponByCode(couponCode, now);
                    if (couponOpt.isPresent()) {
                        Coupon coupon = couponOpt.get();

                        // Check minimum order amount
                        if (coupon.getMinOrderAmount() == null ||
                                subtotal.compareTo(coupon.getMinOrderAmount()) >= 0) {

                            BigDecimal discount = computeDiscount(subtotal, coupon.getType(), coupon.getValue());
                            discountTotal = discountTotal.add(discount);
                            appliedCoupons.add(couponCode);

                            // Increment usage count
                            if (coupon.getId() != null) {
                                couponRepo.incrementUsageCount(coupon.getId());
                                log.info("Incremented usage count for coupon: {}", couponCode);
                            }
                        } else {
                            log.info("Coupon {} not applied: minimum order amount ${} not met (subtotal: ${})",
                                    couponCode, coupon.getMinOrderAmount(), subtotal);
                        }
                    } else {
                        log.info("Coupon code {} is not valid or expired", couponCode);
                    }
                }
            }

            // Apply user-specific discounts
            if (request.getUserId() != null && !request.getUserId().isEmpty()) {
                Optional<User> userOpt = userRepo.findByUserId(request.getUserId());
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    BigDecimal userDiscount = calculateUserDiscount(user, subtotal);
                    if (userDiscount.compareTo(BigDecimal.ZERO) > 0) {
                        discountTotal = discountTotal.add(userDiscount);
                        log.info("Applied user discount: {} for user: {}", userDiscount, request.getUserId());
                    }
                }
            }

            BigDecimal total = subtotal.subtract(discountTotal).max(BigDecimal.ZERO);

            CalculateOrderPricingResponse response = CalculateOrderPricingResponse.newBuilder()
                    .addAllLines(lineResults)
                    .setSubtotal(subtotal.toPlainString())
                    .setDiscountTotal(discountTotal.toPlainString())
                    .setTotal(total.toPlainString())
                    .setCurrencyCode(currency)
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();

            log.info("CalculateOrderPricing completed successfully. Subtotal: {}, Discount: {}, Total: {}, Applied coupons: {}",
                    subtotal, discountTotal, total, appliedCoupons);

        } catch (Exception e) {
            log.error("Error in calculateOrderPricing", e);
            responseObserver.onError(io.grpc.Status.INTERNAL
                    .withDescription("Failed to calculate order pricing: " + e.getMessage())
                    .asRuntimeException());
        }
    }

    // Helper method to calculate all discounts
    private DiscountCalculationResult calculateDiscounts(String productId, BigDecimal subtotal,
                                                         String couponCode, String userId) {
        BigDecimal totalDiscount = BigDecimal.ZERO;
        StringBuilder description = new StringBuilder();
        boolean couponApplied = false;
        LocalDateTime now = LocalDateTime.now();

        try {
            // 1. Apply product-specific discount rules
            if (productId != null && !productId.isEmpty()) {
                List<DiscountRule> productDiscounts = discountRuleRepo
                        .findByProductIdAndIsActiveTrue(productId);

                if (productDiscounts != null) {
                    for (DiscountRule rule : productDiscounts) {
                        if (rule != null && rule.getType() != null && rule.getValue() != null) {
                            BigDecimal discount = computeDiscount(subtotal, rule.getType(), rule.getValue());
                            if (discount.compareTo(BigDecimal.ZERO) > 0) {
                                totalDiscount = totalDiscount.add(discount);
                                if (description.length() > 0) description.append(", ");
                                description.append(rule.getDescription() != null ? rule.getDescription() : "Product Discount");
                                log.info("Applied product discount: {} = {}", rule.getDescription(), discount);
                            }
                        }
                    }
                }
            }

            // 2. Apply campaign discounts
            if (productId != null && !productId.isEmpty()) {
                List<Campaign> campaigns = campaignRepo.findActiveCampaignsByProductId(productId, now);
                if (campaigns != null) {
                    for (Campaign campaign : campaigns) {
                        if (campaign != null && campaign.getDiscountRules() != null) {
                            for (DiscountRule rule : campaign.getDiscountRules()) {
                                if (rule != null && rule.getIsActive() != null && rule.getIsActive() &&
                                        rule.getType() != null && rule.getValue() != null) {
                                    BigDecimal discount = computeDiscount(subtotal, rule.getType(), rule.getValue());
                                    if (discount.compareTo(BigDecimal.ZERO) > 0) {
                                        totalDiscount = totalDiscount.add(discount);
                                        if (description.length() > 0) description.append(", ");
                                        description.append(campaign.getName() != null ? campaign.getName() : "Campaign");
                                        log.info("Applied campaign discount: {} = {}", campaign.getName(), discount);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // 3. Apply coupon if provided
            if (couponCode != null && !couponCode.isBlank()) {
                Optional<Coupon> couponOpt = couponRepo.findValidCouponByCode(couponCode, now);
                if (couponOpt.isPresent()) {
                    Coupon coupon = couponOpt.get();

                    // Check minimum order amount
                    if (coupon.getMinOrderAmount() == null ||
                            subtotal.compareTo(coupon.getMinOrderAmount()) >= 0) {

                        if (coupon.getType() != null && coupon.getValue() != null) {
                            BigDecimal discount = computeDiscount(subtotal, coupon.getType(), coupon.getValue());
                            if (discount.compareTo(BigDecimal.ZERO) > 0) {
                                totalDiscount = totalDiscount.add(discount);
                                couponApplied = true;

                                if (description.length() > 0) description.append(", ");
                                description.append(coupon.getDescription() != null ?
                                        coupon.getDescription() : coupon.getCode());

                                // Increment usage count
                                if (coupon.getId() != null) {
                                    couponRepo.incrementUsageCount(coupon.getId());
                                    log.info("Incremented usage count for coupon: {}", couponCode);
                                }
                                log.info("Applied coupon discount: {} = {}", couponCode, discount);
                            }
                        }
                    } else {
                        log.info("Coupon {} not applied: minimum order amount ${} not met (subtotal: ${})",
                                couponCode, coupon.getMinOrderAmount(), subtotal);
                    }
                }
            }

            // 4. Apply user-specific discounts
            if (userId != null && !userId.isBlank()) {
                Optional<User> userOpt = userRepo.findByUserId(userId);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    BigDecimal userDiscount = calculateUserDiscount(user, subtotal);
                    if (userDiscount != null && userDiscount.compareTo(BigDecimal.ZERO) > 0) {
                        totalDiscount = totalDiscount.add(userDiscount);
                        if (description.length() > 0) description.append(", ");
                        description.append(user.getLoyaltyTier() + " Loyalty discount");
                        log.info("Applied user loyalty discount: {} for tier: {}", userDiscount, user.getLoyaltyTier());
                    }
                }
            }

        } catch (Exception e) {
            log.error("Error calculating discounts", e);
        }

        return new DiscountCalculationResult(totalDiscount, description.toString(), couponApplied);
    }

    private boolean shouldIncludeDiscountForUser(DiscountRule rule, String userSegment) {
        if (rule == null || rule.getDescription() == null) {
            return true;
        }

        String desc = rule.getDescription().toLowerCase();

        // If user is premium, include all discounts
        if ("PREMIUM".equalsIgnoreCase(userSegment)) {
            return true;
        }

        // For regular users, filter out VIP/premium only discounts
        if ("REGULAR".equalsIgnoreCase(userSegment)) {
            return !desc.contains("vip") && !desc.contains("premium") && !desc.contains("exclusive");
        }

        // Default: include all
        return true;
    }

    private String buildDiscountDescription(DiscountRule rule, Campaign campaign) {
        StringBuilder desc = new StringBuilder();

        if (campaign != null && campaign.getName() != null) {
            desc.append(campaign.getName()).append(": ");
        }

        if (rule.getDescription() != null) {
            desc.append(rule.getDescription());
        } else {
            desc.append(rule.getType()).append(" discount of ");
            if ("PERCENTAGE".equalsIgnoreCase(rule.getType())) {
                desc.append(rule.getValue()).append("%");
            } else {
                desc.append("$").append(rule.getValue());
            }
        }

        return desc.toString();
    }

    private String buildCouponDescription(Coupon coupon) {
        StringBuilder desc = new StringBuilder();

        if (coupon.getDescription() != null) {
            desc.append(coupon.getDescription());
        } else {
            desc.append("Coupon ").append(coupon.getCode()).append(": ");
            if ("PERCENTAGE".equalsIgnoreCase(coupon.getType())) {
                desc.append(coupon.getValue()).append("% off");
            } else {
                desc.append("$").append(coupon.getValue()).append(" off");
            }
        }

        if (coupon.getMinOrderAmount() != null && coupon.getMinOrderAmount().compareTo(BigDecimal.ZERO) > 0) {
            desc.append(" (min. order $").append(coupon.getMinOrderAmount()).append(")");
        }

        if (coupon.getExpiresAt() != null) {
            desc.append(" - expires ").append(coupon.getExpiresAt().toLocalDate());
        }

        return desc.toString();
    }

    private BigDecimal getLoyaltyDiscountPercent(String loyaltyTier) {
        if (loyaltyTier == null) {
            return BigDecimal.ZERO;
        }

        switch (loyaltyTier.toUpperCase()) {
            case "GOLD":
                return BigDecimal.valueOf(10);
            case "SILVER":
                return BigDecimal.valueOf(5);
            case "BRONZE":
                return BigDecimal.valueOf(2);
            default:
                return BigDecimal.ZERO;
        }
    }

    private List<DiscountRule> filterDiscountsByUser(List<DiscountRule> rules, User user) {
        if (rules == null || user == null) {
            return rules;
        }

        try {
            if ("PREMIUM".equalsIgnoreCase(user.getUserSegment())) {
                return rules; // All discounts for premium users
            } else if ("REGULAR".equalsIgnoreCase(user.getUserSegment())) {
                // Filter out some discounts for regular users
                return rules.stream()
                        .filter(rule -> rule.getDescription() == null ||
                                !isVipOnlyDiscount(rule.getDescription()))
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            log.error("Error filtering discounts by user", e);
        }
        return rules;
    }

    private boolean isVipOnlyDiscount(String description) {
        if (description == null) return false;
        String lower = description.toLowerCase();
        return lower.contains("vip") || lower.contains("premium") || lower.contains("exclusive");
    }

    private BigDecimal calculateUserDiscount(User user, BigDecimal amount) {
        if (user == null || amount == null) {
            return BigDecimal.ZERO;
        }

        try {
            BigDecimal percent = getLoyaltyDiscountPercent(user.getLoyaltyTier());
            if (percent.compareTo(BigDecimal.ZERO) > 0) {
                return amount.multiply(percent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            }
        } catch (Exception e) {
            log.error("Error calculating user discount", e);
        }
        return BigDecimal.ZERO;
    }

    private BigDecimal computeDiscount(BigDecimal amount, String type, BigDecimal value) {
        if (amount == null || type == null || value == null) {
            return BigDecimal.ZERO;
        }

        try {
            if ("PERCENTAGE".equalsIgnoreCase(type)) {
                return amount.multiply(value).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            } else if ("FIXED".equalsIgnoreCase(type)) {
                return value.min(amount);
            }
        } catch (Exception e) {
            log.error("Error computing discount", e);
        }
        return BigDecimal.ZERO;
    }

    // Inner class for discount calculation result
    @lombok.Value
    private static class DiscountCalculationResult {
        BigDecimal totalDiscount;
        String description;
        boolean couponApplied;
    }
}