package com.nsbm.bunmart.order.mappers.rest;

import com.nsbm.bunmart.order.dto.OrderLineResponseDTO;
import com.nsbm.bunmart.order.dto.OrderResponseDTO;
import com.nsbm.bunmart.order.model.Order;
import com.nsbm.bunmart.order.model.OrderLine;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OrderRestMapper {

    public OrderLineResponseDTO orderLineToDTO(OrderLine line) {
        OrderLineResponseDTO dto = new OrderLineResponseDTO();
        dto.setId(line.getId());
        dto.setProductId(line.getProductId());
        dto.setQuantity(line.getQuantity());
        dto.setUnitPrice(line.getUnitPrice());
        dto.setLineTotal(line.getLineTotal());
        return dto;
    }

    public OrderResponseDTO orderToDTO(Order order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUserId());
        dto.setStatus(order.getStatus());
        dto.setSubtotal(order.getSubtotal());
        dto.setDiscountTotal(order.getDiscountTotal());
        dto.setShippingTotal(order.getShippingTotal());
        dto.setTotal(order.getTotal());
        dto.setCurrencyCode(order.getCurrencyCode());
        dto.setShippingAddressId(order.getShippingAddressId());
        dto.setCouponCodes(order.getCouponCodes());
        dto.setProductionOrderId(order.getProductionOrderId());
        dto.setShipmentId(order.getShipmentId());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        List<OrderLineResponseDTO> lines = order.getOrderLines()
                .stream()
                .map(this::orderLineToDTO)
                .toList();
        dto.setOrderLines(lines);
        return dto;
    }
}
