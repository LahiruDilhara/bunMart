package com.nsbm.bunmart.pricing.grpc;

import com.nsbm.bunmart.pricing.model.Campaign;
import com.nsbm.bunmart.pricing.model.Coupon;
import com.nsbm.bunmart.pricing.model.DiscountRule;
import com.nsbm.bunmart.pricing.model.PriceRule;
import com.nsbm.bunmart.pricing.model.User;
import com.nsbm.bunmart.pricing.repositories.CampaignRepository;
import com.nsbm.bunmart.pricing.repositories.CouponRepository;
import com.nsbm.bunmart.pricing.repositories.DiscountRuleRepository;
import com.nsbm.bunmart.pricing.repositories.PriceRuleRepository;
import com.nsbm.bunmart.pricing.repositories.UserRepository;

import com.nsbm.bunmart.pricing.v1.PricingServiceGrpc;
import com.nsbm.bunmart.pricing.v1.GetPricesRequest;
import com.nsbm.bunmart.pricing.v1.GetPricesResponse;
import com.nsbm.bunmart.pricing.v1.PriceInfo;
import com.nsbm.bunmart.pricing.v1.GetDiscountsRequest;
import com.nsbm.bunmart.pricing.v1.GetDiscountsResponse;
import com.nsbm.bunmart.pricing.v1.DiscountInfo;
import com.nsbm.bunmart.pricing.v1.CalculatePriceRequest;
import com.nsbm.bunmart.pricing.v1.CalculatePriceResponse;
import com.nsbm.bunmart.pricing.v1.CalculateOrderPricingRequest;
import com.nsbm.bunmart.pricing.v1.CalculateOrderPricingResponse;

import io.grpc.stub.StreamObserver;
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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

@GrpcService
public class PricingGrpcService extends PricingServiceGrpc.PricingServiceImplBase {

    private static final Logger log = LoggerFactory.getLogger(PricingGrpcService.class);

    private final PriceRuleRepository priceRuleRepo;
    private final DiscountRuleRepository discountRuleRepo;
    private final CouponRepository couponRepo;
    private final CampaignRepository campaignRepo;
    private final UserRepository userRepo;

    @Autowired
    public PricingGrpcService(
            PriceRuleRepository priceRuleRepo,
            DiscountRuleRepository discountRuleRepo,
            CouponRepository couponRepo,
            CampaignRepository campaignRepo,
            UserRepository userRepo) {
        this.priceRuleRepo = priceRuleRepo;
        this.discountRuleRepo = discountRuleRepo;
        this.couponRepo = couponRepo;
        this.campaignRepo = campaignRepo;
        this.userRepo = userRepo;
    }

    @Override
    public void getPrices(GetPricesRequest request, StreamObserver<GetPricesResponse> responseObserver) {
        try {
            log.info("GetPrices request for products: {}", request.getProductIdsList());

            List<PriceRule> rules = priceRuleRepo.findLatestByProductIdInAndIsActiveTrue(request.getProductIdsList());

            List<PriceInfo> priceInfos = rules.stream()
                    .map(rule -> {
                        PriceInfo.Builder builder = PriceInfo.newBuilder()
                                .setProductId(rule.getProductId());

                        if (rule.getUnitPrice() != null) {
                            builder.setUnitPrice(rule.getUnitPrice().toPlainString());
                        } else {
                            builder.setUnitPrice("0");
                        }

                        builder.setCurrencyCode(rule.getCurrencyCode() != null ? rule.getCurrencyCode() : "USD");

                        return builder.build();
                    })
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
                    if (shouldIncludeDiscountForUser(rule, userSegment)) {
                        DiscountInfo.Builder builder = DiscountInfo.newBuilder()
                                .setDiscountId("RULE_" + rule.getId())
                                .setProductId(rule.getProductId() != null ? rule.getProductId() : "");

                        if (rule.getType() != null) {
                            builder.setType(rule.getType());
                        }

                        if (rule.getValue() != null) {
                            builder.setValue(rule.getValue().toPlainString());
                        } else {
                            builder.setValue("0");
                        }

                        builder.setDescription(buildDiscountDescription(rule, null));

                        discountInfos.add(builder.build());
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

                                if (shouldIncludeDiscountForUser(rule, userSegment)) {
                                    DiscountInfo.Builder builder = DiscountInfo.newBuilder()
                                            .setDiscountId("CAMPAIGN_" + campaign.getId() + "_" + rule.getId())
                                            .setProductId(rule.getProductId() != null ? rule.getProductId() : productId);

                                    if (rule.getType() != null) {
                                        builder.setType(rule.getType());
                                    }

                                    if (rule.getValue() != null) {
                                        builder.setValue(rule.getValue().toPlainString());
                                    } else {
                                        builder.setValue("0");
                                    }

                                    builder.setDescription(buildDiscountDescription(rule, campaign));

                                    discountInfos.add(builder.build());
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
                    if (discountPercent != null && discountPercent.compareTo(BigDecimal.ZERO) > 0) {
                        discountInfos.add(DiscountInfo.newBuilder()
                                .setDiscountId(loyaltyDiscountId)
                                .setProductId("")
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
                            .setProductId("")
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

                    if (!seenDiscountIds.contains(couponDiscountId)) {
                        DiscountInfo.Builder builder = DiscountInfo.newBuilder()
                                .setDiscountId(couponDiscountId)
                                .setProductId("");

                        if (coupon.getType() != null) {
                            builder.setType(coupon.getType());
                        }

                        if (coupon.getValue() != null) {
                            builder.setValue(coupon.getValue().toPlainString());
                        } else {
                            builder.setValue("0");
                        }

                        builder.setDescription(buildCouponDescription(coupon));

                        discountInfos.add(builder.build());
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

            if (request.getQuantity() <= 0) {
                responseObserver.onError(io.grpc.Status.INVALID_ARGUMENT
                        .withDescription("Quantity must be positive")
                        .asRuntimeException());
                return;
            }

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

            if (priceRule.getId() != null) {
                log.info("Found price rule ID: {} with price: {}", priceRule.getId(),
                        priceRule.getUnitPrice() != null ? priceRule.getUnitPrice() : BigDecimal.ZERO);
            }

            BigDecimal unitPrice = priceRule.getUnitPrice() != null ? priceRule.getUnitPrice() : BigDecimal.ZERO;
            int quantity = request.getQuantity();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));

            DiscountCalculationResult discountResult = calculateDiscounts(
                    request.getProductId(),
                    subtotal,
                    request.getCouponCode() != null ? request.getCouponCode() : "",
                    request.getUserId() != null ? request.getUserId() : ""
            );

            BigDecimal total = subtotal.subtract(discountResult.getTotalDiscount() != null ?
                    discountResult.getTotalDiscount() : BigDecimal.ZERO).max(BigDecimal.ZERO);

            CalculatePriceResponse.Builder responseBuilder = CalculatePriceResponse.newBuilder()
                    .setProductId(request.getProductId())
                    .setQuantity(quantity)
                    .setUnitPrice(unitPrice.toPlainString())
                    .setSubtotal(subtotal.toPlainString())
                    .setDiscountAmount(discountResult.getTotalDiscount() != null ?
                            discountResult.getTotalDiscount().toPlainString() : "0")
                    .setDiscountDescription(discountResult.getDescription() != null ?
                            discountResult.getDescription() : "")
                    .setTotal(total.toPlainString())
                    .setCurrencyCode(priceRule.getCurrencyCode() != null ? priceRule.getCurrencyCode() : "USD")
                    .setCouponApplied(discountResult.isCouponApplied());

            responseObserver.onNext(responseBuilder.build());
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

            BigDecimal discountTotal = BigDecimal.ZERO;
            LocalDateTime now = LocalDateTime.now();
            List<String> appliedCoupons = new ArrayList<>();

            for (String couponCode : request.getCouponCodesList()) {
                if (couponCode != null && !couponCode.isEmpty()) {
                    Optional<Coupon> couponOpt = couponRepo.findValidCouponByCode(couponCode, now);
                    if (couponOpt.isPresent()) {
                        Coupon coupon = couponOpt.get();

                        if (coupon.getMinOrderAmount() == null ||
                                subtotal.compareTo(coupon.getMinOrderAmount()) >= 0) {

                            BigDecimal discount = computeDiscount(subtotal, coupon.getType(), coupon.getValue());
                            discountTotal = discountTotal.add(discount);
                            appliedCoupons.add(couponCode);

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

            if (request.getUserId() != null && !request.getUserId().isEmpty()) {
                Optional<User> userOpt = userRepo.findByUserId(request.getUserId());
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    BigDecimal userDiscount = calculateUserDiscount(user, subtotal);
                    if (userDiscount != null && userDiscount.compareTo(BigDecimal.ZERO) > 0) {
                        discountTotal = discountTotal.add(userDiscount);
                        log.info("Applied user discount: {} for user: {}", userDiscount, request.getUserId());
                    }
                }
            }

            BigDecimal total = subtotal.subtract(discountTotal != null ? discountTotal : BigDecimal.ZERO).max(BigDecimal.ZERO);

            CalculateOrderPricingResponse response = CalculateOrderPricingResponse.newBuilder()
                    .addAllLines(lineResults)
                    .setSubtotal(subtotal.toPlainString())
                    .setDiscountTotal(discountTotal != null ? discountTotal.toPlainString() : "0")
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

    private DiscountCalculationResult calculateDiscounts(String productId, BigDecimal subtotal,
                                                         String couponCode, String userId) {
        BigDecimal totalDiscount = BigDecimal.ZERO;
        StringBuilder description = new StringBuilder();
        boolean couponApplied = false;
        LocalDateTime now = LocalDateTime.now();

        try {
            // 1. Apply product-specific discount rules
            if (productId != null && !productId.isEmpty()) {
                List<DiscountRule> productDiscounts = discountRuleRepo.findByProductIdAndIsActiveTrue(productId);

                if (productDiscounts != null) {
                    for (DiscountRule rule : productDiscounts) {
                        if (rule != null && rule.getType() != null && rule.getValue() != null) {
                            BigDecimal discount = computeDiscount(subtotal, rule.getType(), rule.getValue());
                            if (discount != null && discount.compareTo(BigDecimal.ZERO) > 0) {
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
                                    if (discount != null && discount.compareTo(BigDecimal.ZERO) > 0) {
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

                    if (coupon.getMinOrderAmount() == null ||
                            subtotal.compareTo(coupon.getMinOrderAmount()) >= 0) {

                        if (coupon.getType() != null && coupon.getValue() != null) {
                            BigDecimal discount = computeDiscount(subtotal, coupon.getType(), coupon.getValue());
                            if (discount != null && discount.compareTo(BigDecimal.ZERO) > 0) {
                                totalDiscount = totalDiscount.add(discount);
                                couponApplied = true;

                                if (description.length() > 0) description.append(", ");
                                description.append(coupon.getDescription() != null ?
                                        coupon.getDescription() : coupon.getCode());

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

        if ("PREMIUM".equalsIgnoreCase(userSegment)) {
            return true;
        }

        if ("REGULAR".equalsIgnoreCase(userSegment)) {
            return !desc.contains("vip") && !desc.contains("premium") && !desc.contains("exclusive");
        }

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
            desc.append(rule.getType() != null ? rule.getType() : "Discount").append(" of ");
            if ("PERCENTAGE".equalsIgnoreCase(rule.getType())) {
                desc.append(rule.getValue() != null ? rule.getValue() : BigDecimal.ZERO).append("%");
            } else {
                desc.append("$").append(rule.getValue() != null ? rule.getValue() : BigDecimal.ZERO);
            }
        }

        return desc.toString();
    }

    private String buildCouponDescription(Coupon coupon) {
        StringBuilder desc = new StringBuilder();

        if (coupon.getDescription() != null) {
            desc.append(coupon.getDescription());
        } else {
            desc.append("Coupon ").append(coupon.getCode() != null ? coupon.getCode() : "").append(": ");
            if ("PERCENTAGE".equalsIgnoreCase(coupon.getType())) {
                desc.append(coupon.getValue() != null ? coupon.getValue() : BigDecimal.ZERO).append("% off");
            } else {
                desc.append("$").append(coupon.getValue() != null ? coupon.getValue() : BigDecimal.ZERO).append(" off");
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

    private BigDecimal calculateUserDiscount(User user, BigDecimal amount) {
        if (user == null || amount == null) {
            return BigDecimal.ZERO;
        }

        try {
            BigDecimal percent = getLoyaltyDiscountPercent(user.getLoyaltyTier());
            if (percent != null && percent.compareTo(BigDecimal.ZERO) > 0) {
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

    // Manual implementation of DiscountCalculationResult
    private static class DiscountCalculationResult {
        private final BigDecimal totalDiscount;
        private final String description;
        private final boolean couponApplied;

        public DiscountCalculationResult(BigDecimal totalDiscount, String description, boolean couponApplied) {
            this.totalDiscount = totalDiscount;
            this.description = description;
            this.couponApplied = couponApplied;
        }

        public BigDecimal getTotalDiscount() { return totalDiscount; }
        public String getDescription() { return description; }
        public boolean isCouponApplied() { return couponApplied; }
    }
}