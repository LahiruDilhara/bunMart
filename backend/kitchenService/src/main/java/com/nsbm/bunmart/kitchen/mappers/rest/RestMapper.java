package com.nsbm.bunmart.kitchen.mappers.rest;

import com.nsbm.bunmart.kitchen.dto.ImageDTO;
import com.nsbm.bunmart.kitchen.dto.ProductionLineDTO;
import com.nsbm.bunmart.kitchen.dto.ProductionOrderResponseDTO;
import com.nsbm.bunmart.kitchen.model.PreparationImage;
import com.nsbm.bunmart.kitchen.model.ProductionLine;
import com.nsbm.bunmart.kitchen.model.ProductionOrder;
import org.springframework.stereotype.Component;

@Component
public class RestMapper {

    public ProductionOrderResponseDTO toResponseDTO(ProductionOrder order) {
        ProductionOrderResponseDTO dto = new ProductionOrderResponseDTO();
        dto.setId(order.getId());
        dto.setUserOrderId(order.getUserOrderId());
        dto.setPhase(order.getPhase());
        dto.setProgressPercent(order.getProgressPercent());
        dto.setNotes(order.getNotes());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setLines(order.getLines().stream().map(this::toLineDTO).toList());
        dto.setImages(order.getImages().stream().map(this::toImageDTO).toList());
        return dto;
    }

    public ProductionLineDTO toLineDTO(ProductionLine line) {
        return new ProductionLineDTO(line.getProductId(), line.getQuantity());
    }

    public ImageDTO toImageDTO(PreparationImage image) {
        return new ImageDTO(image.getId(), image.getImageUrl());
    }
}
