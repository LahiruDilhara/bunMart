package com.nsbm.bunmart.pricing.mappers.grpc;

import com.nsbm.bunmart.pricing.dto.CalculatePriceRequestDTO;
import com.nsbm.bunmart.pricing.dto.CalculatePriceResponseDTO;
import com.nsbm.bunmart.pricing.model.Product;
import com.nsbm.bunmart.pricing.v1.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Maps between pricing domain models/DTOs and pricing proto messages.
 */
@Component
public class GRPCMapper {

    public GetProductPriceResponse toGetProductPriceResponse(Product product) {
        BigDecimal unitPrice = product.getRawPrice() != null ? product.getRawPrice() : BigDecimal.ZERO;
        return GetProductPriceResponse.newBuilder()
                .setProductId(product.getId())
                .setUnitPrice(unitPrice.toPlainString())
                .setRawPrice(product.getRawPrice() != null ? product.getRawPrice().toPlainString() : "0")
                .setTax(product.getTax() != null ? product.getTax().toPlainString() : "0")
                .setCurrencyCode(product.getCurrencyCode() != null ? product.getCurrencyCode() : "USD")
                .build();
    }

    public CalculatePriceRequestDTO toCalculatePriceRequestDTO(CalculateOrderPricingRequest request) {
        List<CalculatePriceRequestDTO.LineItemDTO> items = request.getItemsList().stream()
                .map(line -> new CalculatePriceRequestDTO.LineItemDTO(line.getProductId(), line.getQuantity()))
                .collect(Collectors.toList());
        return new CalculatePriceRequestDTO(items, null);
    }

    public CalculateOrderPricingResponse toCalculateOrderPricingResponse(CalculatePriceResponseDTO dto) {
        List<LineResult> lines = dto.getLineItems() != null
                ? dto.getLineItems().stream().map(this::toLineResult).collect(Collectors.toList())
                : List.of();
        return CalculateOrderPricingResponse.newBuilder()
                .addAllLines(lines)
                .setSubtotal(dto.getSubtotal() != null ? dto.getSubtotal().toPlainString() : "0")
                .setDiscountTotal(dto.getDiscountTotal() != null ? dto.getDiscountTotal().toPlainString() : "0")
                .setShippingTotal(dto.getShippingTotal() != null ? dto.getShippingTotal().toPlainString() : "0")
                .setTaxTotal(dto.getTaxTotal() != null ? dto.getTaxTotal().toPlainString() : "0")
                .setTotal(dto.getTotal() != null ? dto.getTotal().toPlainString() : "0")
                .setCurrencyCode(dto.getCurrencyCode() != null ? dto.getCurrencyCode() : "USD")
                .build();
    }

    private LineResult toLineResult(CalculatePriceResponseDTO.LineItemPriceDTO line) {
        return LineResult.newBuilder()
                .setProductId(line.getProductId())
                .setQuantity(line.getQuantity() != null ? line.getQuantity() : 0)
                .setUnitPrice(line.getUnitPrice() != null ? line.getUnitPrice().toPlainString() : "0")
                .setLineTotal(line.getLineTotal() != null ? line.getLineTotal().toPlainString() : "0")
                .build();
    }

    public ValidateCouponResponse toValidateCouponResponse(boolean valid, String discountAmount) {
        return ValidateCouponResponse.newBuilder()
                .setValid(valid)
                .setDiscountAmount(discountAmount != null ? discountAmount : "0")
                .build();
    }
}
