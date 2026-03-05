package com.nsbm.bunmart.kitchen.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class CreateKitchenOrderRequestDTO {

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Order ID is required")
    private String orderId;

    @NotEmpty(message = "At least one line is required")
    @Valid
    private List<LineItemDTO> lines;

    public CreateKitchenOrderRequestDTO() {}

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public List<LineItemDTO> getLines() { return lines; }
    public void setLines(List<LineItemDTO> lines) { this.lines = lines; }

    public static class LineItemDTO {
        @NotBlank(message = "Product ID is required")
        private String productId;
        private int quantity = 1;

        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }
}
