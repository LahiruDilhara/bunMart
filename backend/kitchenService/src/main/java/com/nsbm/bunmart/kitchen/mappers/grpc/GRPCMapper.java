package com.nsbm.bunmart.kitchen.mappers.grpc;

import com.nsbm.bunmart.kitchen.dto.CreateKitchenOrderRequestDTO;
import com.nsbm.bunmart.kitchen.model.KitchenOrder;
import com.nsbm.bunmart.kitchen.model.KitchenOrderLine;
import com.nsbm.bunmart.kitchen.v1.*;
import com.google.protobuf.Timestamp;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

/**
 * Maps between kitchen domain models/DTOs and kitchen proto messages.
 */
@Component
public class GRPCMapper {

    public List<CreateKitchenOrderRequestDTO.LineItemDTO> toLineItemDTOs(CreateKitchenOrderRequest request) {
        return request.getLinesList().stream()
                .map(line -> {
                    CreateKitchenOrderRequestDTO.LineItemDTO dto = new CreateKitchenOrderRequestDTO.LineItemDTO();
                    dto.setProductId(line.getProductId());
                    dto.setQuantity(line.getQuantity());
                    return dto;
                })
                .toList();
    }

    public CreateKitchenOrderResponse toCreateKitchenOrderResponse(KitchenOrder order) {
        return CreateKitchenOrderResponse.newBuilder()
                .setKitchenOrderId(order.getId())
                .build();
    }

    public GetKitchenOrderResponse toGetKitchenOrderResponse(KitchenOrder order) {
        return GetKitchenOrderResponse.newBuilder()
                .setOrder(toKitchenOrderInfo(order))
                .build();
    }

    public KitchenOrderInfo toKitchenOrderInfo(KitchenOrder order) {
        KitchenOrderInfo.Builder builder = KitchenOrderInfo.newBuilder()
                .setKitchenOrderId(order.getId())
                .setUserId(order.getUserId())
                .setOrderId(order.getOrderId())
                .setStatus(order.getStatus())
                .addAllLines(order.getLines().stream().map(this::toKitchenOrderLineInfo).toList());
        if (order.getCreatedAt() != null) {
            builder.setCreatedAt(toTimestamp(order.getCreatedAt()));
        }
        if (order.getUpdatedAt() != null) {
            builder.setUpdatedAt(toTimestamp(order.getUpdatedAt()));
        }
        return builder.build();
    }

    public KitchenOrderLineInfo toKitchenOrderLineInfo(KitchenOrderLine line) {
        return KitchenOrderLineInfo.newBuilder()
                .setLineId(line.getId())
                .setProductId(line.getProductId())
                .setQuantity(line.getQuantity())
                .setProgress(line.getProgress())
                .setStatus(line.getStatus())
                .build();
    }

    public UpdateKitchenOrderStatusResponse toUpdateKitchenOrderStatusResponse(boolean updated) {
        return UpdateKitchenOrderStatusResponse.newBuilder().setUpdated(updated).build();
    }

    private static Timestamp toTimestamp(Instant instant) {
        return Timestamp.newBuilder()
                .setSeconds(instant.getEpochSecond())
                .setNanos(instant.getNano())
                .build();
    }
}
