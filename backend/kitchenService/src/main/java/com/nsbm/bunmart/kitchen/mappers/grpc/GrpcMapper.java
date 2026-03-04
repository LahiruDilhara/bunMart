package com.nsbm.bunmart.kitchen.mappers.grpc;

import com.google.protobuf.Timestamp;
import com.nsbm.bunmart.kitchen.model.PreparationImage;
import com.nsbm.bunmart.kitchen.model.ProductionLine;
import com.nsbm.bunmart.kitchen.model.ProductionOrder;
import com.nsbm.bunmart.kitchen.v1.*;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class GrpcMapper {

    public ProductionOrderInfo toProductionOrderInfo(ProductionOrder order) {
        ProductionOrderInfo.Builder builder = ProductionOrderInfo.newBuilder()
                .setProductionOrderId(order.getId())
                .setUserOrderId(order.getUserOrderId())
                .setPhase(order.getPhase())
                .setProgressPercent(order.getProgressPercent());

        if (order.getNotes() != null) {
            builder.setNotes(order.getNotes());
        }

        for (ProductionLine line : order.getLines()) {
            builder.addLines(ProductionOrderLine.newBuilder()
                    .setProductId(line.getProductId())
                    .setQuantity(line.getQuantity())
                    .build());
        }

        for (PreparationImage image : order.getImages()) {
            builder.addPreparationImageUrls(image.getImageUrl());
        }

        if (order.getCreatedAt() != null) {
            builder.setCreatedAt(instantToTimestamp(order.getCreatedAt()));
        }
        if (order.getUpdatedAt() != null) {
            builder.setUpdatedAt(instantToTimestamp(order.getUpdatedAt()));
        }

        return builder.build();
    }

    public GetProductionOrderResponse toGetResponse(ProductionOrder order) {
        return GetProductionOrderResponse.newBuilder()
                .setOrder(toProductionOrderInfo(order))
                .build();
    }

    public CreateProductionOrderResponse toCreateResponse(String productionOrderId) {
        return CreateProductionOrderResponse.newBuilder()
                .setProductionOrderId(productionOrderId)
                .build();
    }

    private Timestamp instantToTimestamp(Instant instant) {
        return Timestamp.newBuilder()
                .setSeconds(instant.getEpochSecond())
                .setNanos(instant.getNano())
                .build();
    }
}
