package com.nsbm.bunmart.kitchen.mappers.rest;

import com.nsbm.bunmart.kitchen.dto.KitchenOrderLineDTO;
import com.nsbm.bunmart.kitchen.dto.KitchenOrderResponseDTO;
import com.nsbm.bunmart.kitchen.model.KitchenOrder;
import com.nsbm.bunmart.kitchen.model.KitchenOrderLine;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class KitchenMapper {

    public KitchenOrderResponseDTO toResponseDTO(KitchenOrder order) {
        KitchenOrderResponseDTO dto = new KitchenOrderResponseDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUserId());
        dto.setOrderId(order.getOrderId());
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setLines(order.getLines().stream().map(this::toLineDTO).toList());
        return dto;
    }

    public KitchenOrderLineDTO toLineDTO(KitchenOrderLine line) {
        return new KitchenOrderLineDTO(
                line.getId(),
                line.getProductId(),
                line.getQuantity(),
                line.getProgress(),
                line.getStatus()
        );
    }
}
