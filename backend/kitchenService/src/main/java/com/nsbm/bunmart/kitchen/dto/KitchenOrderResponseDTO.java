package com.nsbm.bunmart.kitchen.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KitchenOrderResponseDTO {

    private String orderId;
    private String status;
    private LocalDateTime placedAt;
    private String specialInstructions;

    // List of items to be prepared
    private List<OrderItemDTO> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDTO {
        private String productId;
        private String productName;
        private Integer quantity;
        private List<String> toppings;
    }
}