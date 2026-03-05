package com.nsbm.bunmart.pricing.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductPriceInfoDTO {
    private String productId;
    private String productName;
    private BigDecimal currentPrice;
    private BigDecimal rawPrice;
    private BigDecimal tax;
    private List<DiscountInfoDTO> discounts;
    private String discountDescription;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiscountInfoDTO {
        private String type;      // DISCOUNT or COUPON
        private Integer minQuantity;
        private String description;
        private BigDecimal value;
        private String code;      // for coupon
    }
}
