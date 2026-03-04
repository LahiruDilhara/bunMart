package com.nsbm.bunmart.kitchen.mappers.grpc;

import com.nsbm.bunmart.kitchen.model.KitchenOrder;
import com.nsbm.bunmart.kitchen.model.KitchenOrderItem;
import com.nsbm.bunmart.kitchen.model.KitchenStatus;
import com.nsbm.order.stubs.OrderResponse; // Generated from order.proto
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class GRPCMapper {

    public KitchenOrder mapOrderResponseToEntity(OrderResponse response) {
        return KitchenOrder.builder()
                .id(response.getOrderId())
                .status(KitchenStatus.RECEIVED)
                .instructions(response.getSpecialNotes())
                .items(response.getItemsList().stream().map(item ->
                        KitchenOrderItem.builder()
                                .productId(item.getProductId())
                                .productName(item.getProductName())
                                .quantity(item.getQuantity())
                                .build()
                ).collect(Collectors.toList()))
                .build();
    }
}