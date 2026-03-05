package com.nsbm.bunmart.pricing.mappers.rest;

import com.nsbm.bunmart.pricing.dto.*;
import com.nsbm.bunmart.pricing.model.Coupon;
import com.nsbm.bunmart.pricing.model.Discount;
import com.nsbm.bunmart.pricing.model.Product;
import org.springframework.stereotype.Component;

@Component
public class PricingMapper {

    public ProductResponseDTO toProductResponseDTO(Product p) {
        if (p == null) return null;
        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setRawPrice(p.getRawPrice());
        dto.setTax(p.getTax());
        dto.setShippingCost(p.getShippingCost());
        dto.setCurrencyCode(p.getCurrencyCode());
        dto.setIsActive(p.getIsActive());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }

    public DiscountResponseDTO toDiscountResponseDTO(Discount d) {
        if (d == null) return null;
        DiscountResponseDTO dto = new DiscountResponseDTO();
        dto.setId(d.getId());
        dto.setProductId(d.getProductId());
        dto.setMinQuantity(d.getMinQuantity());
        dto.setType(d.getType());
        dto.setValue(d.getValue());
        dto.setDescription(d.getDescription());
        dto.setIsActive(d.getIsActive());
        dto.setCreatedAt(d.getCreatedAt());
        dto.setUpdatedAt(d.getUpdatedAt());
        return dto;
    }

    public CouponResponseDTO toCouponResponseDTO(Coupon c) {
        if (c == null) return null;
        CouponResponseDTO dto = new CouponResponseDTO();
        dto.setId(c.getId());
        dto.setCode(c.getCode());
        dto.setProductId(c.getProductId());
        dto.setMinQuantity(c.getMinQuantity());
        dto.setType(c.getType());
        dto.setValue(c.getValue());
        dto.setDescription(c.getDescription());
        dto.setMinOrderAmount(c.getMinOrderAmount());
        dto.setUsageLimit(c.getUsageLimit());
        dto.setUsedCount(c.getUsedCount());
        dto.setIsActive(c.getIsActive());
        dto.setExpiresAt(c.getExpiresAt());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());
        return dto;
    }
}
