package com.nsbm.bunmart.order.mappers.rest;

import com.nsbm.bunmart.order.dto.OrderProductDTO;
import com.nsbm.bunmart.order.dto.OrderResponseDTO;
import com.nsbm.bunmart.order.model.Order;
import com.nsbm.bunmart.order.model.OrderProduct;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OrderRestMapper {

    public OrderResponseDTO orderToDTO(Order order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUserId());
        dto.setStatus(order.getStatus());
        dto.setSubtotal(order.getSubtotal());
        dto.setDiscountTotal(order.getDiscountTotal());
        dto.setShippingTotal(order.getShippingTotal());
        dto.setTaxTotal(order.getTaxTotal());
        dto.setTotal(order.getTotal());
        dto.setCurrencyCode(order.getCurrencyCode());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setShipmentId(order.getShipmentId());
        dto.setPaymentId(order.getPaymentId());
        dto.setProducts(order.getProducts() != null
                ? order.getProducts().stream().map(this::orderProductToDTO).toList()
                : List.of());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        return dto;
    }

    private OrderProductDTO orderProductToDTO(OrderProduct p) {
        return new OrderProductDTO(p.getProductId(), p.getQuantity());
    }
}
