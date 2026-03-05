package com.nsbm.bunmart.pricing.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalculatePriceResponseDTO {
    private BigDecimal subtotal;
    private BigDecimal discountTotal;
    private BigDecimal shippingTotal;
    private BigDecimal taxTotal;
    private BigDecimal total;
    private String currencyCode;
    private List<LineItemPriceDTO> lineItems;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LineItemPriceDTO {
        private String productId;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal lineSubtotal;
        private BigDecimal lineDiscount;
        private BigDecimal lineShipping;
        private BigDecimal lineTax;
        private BigDecimal lineTotal;
        private String discountDescription;
    }
}
