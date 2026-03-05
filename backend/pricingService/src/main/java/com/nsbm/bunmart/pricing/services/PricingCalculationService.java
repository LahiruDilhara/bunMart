package com.nsbm.bunmart.pricing.services;

import com.nsbm.bunmart.pricing.dto.CalculatePriceResponseDTO;
import com.nsbm.bunmart.pricing.dto.ProductPriceInfoDTO;
import com.nsbm.bunmart.pricing.model.Coupon;
import com.nsbm.bunmart.pricing.model.Discount;
import com.nsbm.bunmart.pricing.model.Product;
import com.nsbm.bunmart.pricing.repositories.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PricingCalculationService {

    private static final int SCALE = 4;
    private static final RoundingMode ROUNDING = RoundingMode.HALF_UP;

    private final ProductService productService;
    private final DiscountService discountService;
    private final CouponRepository couponRepository;

    public CalculatePriceResponseDTO calculate(List<String> productIds, List<Integer> quantities) {
        if (productIds == null || quantities == null || productIds.size() != quantities.size()) {
            throw new IllegalArgumentException("productIds and quantities must be same size");
        }
        List<Product> products = productService.getByIds(productIds);
        List<Discount> allDiscounts = productIds.isEmpty() ? List.of() : discountService.getByProductIds(productIds);
        List<Coupon> validCoupons = couponRepository.findValidCoupons(LocalDateTime.now());

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal discountTotal = BigDecimal.ZERO;
        BigDecimal shippingTotal = BigDecimal.ZERO;
        BigDecimal taxTotal = BigDecimal.ZERO;
        List<CalculatePriceResponseDTO.LineItemPriceDTO> lineItems = new ArrayList<>();
        String currencyCode = "USD";

        for (int i = 0; i < productIds.size(); i++) {
            String pid = productIds.get(i);
            int qty = quantities.get(i) != null ? Math.max(0, quantities.get(i)) : 0;
            Product product = products.stream().filter(p -> p.getId().equals(pid)).findFirst().orElse(null);
            if (product == null || qty <= 0) continue;
            if (product.getCurrencyCode() != null) currencyCode = product.getCurrencyCode();

            BigDecimal unitPrice = product.getRawPrice();
            BigDecimal lineSubtotal = unitPrice.multiply(BigDecimal.valueOf(qty)).setScale(SCALE, ROUNDING);
            BigDecimal lineDiscount = BigDecimal.ZERO;
            StringBuilder discountDesc = new StringBuilder();

            List<Discount> productDiscounts = allDiscounts.stream()
                    .filter(d -> d.getProductId().equals(pid) && qty >= d.getMinQuantity())
                    .sorted((a, b) -> b.getMinQuantity().compareTo(a.getMinQuantity()))
                    .collect(Collectors.toList());
            Discount bestDiscount = productDiscounts.isEmpty() ? null : productDiscounts.get(0);
            if (bestDiscount != null) {
                BigDecimal discountAmount = applyDiscount(unitPrice, qty, bestDiscount.getType(), bestDiscount.getValue());
                lineDiscount = lineDiscount.add(discountAmount);
                if (discountDesc.length() > 0) discountDesc.append("; ");
                discountDesc.append(bestDiscount.getDescription() != null ? bestDiscount.getDescription() : "Discount " + bestDiscount.getType());
            }

            List<Coupon> productCoupons = validCoupons.stream()
                    .filter(c -> pid.equals(c.getProductId()) && c.getMinQuantity() != null && qty >= c.getMinQuantity())
                    .collect(Collectors.toList());
            if (!productCoupons.isEmpty()) {
                Coupon bestCoupon = productCoupons.get(0);
                BigDecimal couponAmount = applyDiscount(unitPrice, qty, bestCoupon.getType(), bestCoupon.getValue());
                lineDiscount = lineDiscount.add(couponAmount);
                if (discountDesc.length() > 0) discountDesc.append("; ");
                discountDesc.append(bestCoupon.getDescription() != null ? bestCoupon.getDescription() : "Coupon " + bestCoupon.getCode());
            }

            BigDecimal lineAfterDiscount = lineSubtotal.subtract(lineDiscount).setScale(SCALE, ROUNDING);
            BigDecimal taxRate = product.getTax() != null ? product.getTax() : BigDecimal.ZERO;
            BigDecimal lineTax = lineAfterDiscount.multiply(taxRate).setScale(SCALE, ROUNDING);
            BigDecimal lineShipping = (product.getShippingCost() != null ? product.getShippingCost() : BigDecimal.ZERO)
                    .multiply(BigDecimal.valueOf(qty)).setScale(SCALE, ROUNDING);
            BigDecimal lineTotal = lineAfterDiscount.add(lineTax).add(lineShipping).setScale(SCALE, ROUNDING);

            subtotal = subtotal.add(lineSubtotal);
            discountTotal = discountTotal.add(lineDiscount);
            taxTotal = taxTotal.add(lineTax);
            shippingTotal = shippingTotal.add(lineShipping);

            lineItems.add(new CalculatePriceResponseDTO.LineItemPriceDTO(
                    pid,
                    product.getName(),
                    qty,
                    unitPrice,
                    lineSubtotal,
                    lineDiscount,
                    lineShipping,
                    lineTax,
                    lineTotal,
                    discountDesc.toString()
            ));
        }

        BigDecimal total = subtotal.subtract(discountTotal).add(taxTotal).add(shippingTotal).setScale(SCALE, ROUNDING);
        return new CalculatePriceResponseDTO(subtotal, discountTotal, shippingTotal, taxTotal, total, currencyCode, lineItems);
    }

    public List<ProductPriceInfoDTO> getProductPrices(List<String> productIds) {
        List<Product> products = productService.getByIds(productIds);
        List<Discount> discounts = productIds.isEmpty() ? List.of() : discountService.getByProductIds(productIds);
        List<Coupon> coupons = couponRepository.findByProductIdInAndIsActiveTrue(productIds);

        List<ProductPriceInfoDTO> result = new ArrayList<>();
        for (String pid : productIds) {
            Product product = products.stream().filter(p -> p.getId().equals(pid)).findFirst().orElse(null);
            if (product == null) continue;

            List<ProductPriceInfoDTO.DiscountInfoDTO> discountInfos = new ArrayList<>();
            discounts.stream().filter(d -> d.getProductId().equals(pid))
                    .forEach(d -> discountInfos.add(new ProductPriceInfoDTO.DiscountInfoDTO("DISCOUNT", d.getMinQuantity(), d.getDescription(), d.getValue(), null)));
            coupons.stream().filter(c -> pid.equals(c.getProductId()))
                    .forEach(c -> discountInfos.add(new ProductPriceInfoDTO.DiscountInfoDTO("COUPON", c.getMinQuantity(), c.getDescription(), c.getValue(), c.getCode())));

            String discountDescription = discountInfos.stream()
                    .map(d -> d.getDescription() != null ? d.getDescription() : (d.getType() + " (min qty: " + d.getMinQuantity() + ")"))
                    .collect(Collectors.joining("; "));

            result.add(new ProductPriceInfoDTO(
                    product.getId(),
                    product.getName(),
                    product.getRawPrice(),
                    product.getRawPrice(),
                    product.getTax(),
                    discountInfos,
                    discountDescription
            ));
        }
        return result;
    }

    private BigDecimal applyDiscount(BigDecimal unitPrice, int qty, String type, BigDecimal value) {
        if (type == null || value == null) return BigDecimal.ZERO;
        if ("PERCENT".equalsIgnoreCase(type)) {
            return unitPrice.multiply(BigDecimal.valueOf(qty)).multiply(value).divide(BigDecimal.valueOf(100), SCALE, ROUNDING);
        }
        if ("FIXED".equalsIgnoreCase(type)) {
            return value.multiply(BigDecimal.valueOf(qty)).setScale(SCALE, ROUNDING);
        }
        return BigDecimal.ZERO;
    }
}
