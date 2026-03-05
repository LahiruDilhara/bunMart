package com.nsbm.bunmart.kitchen.dto;

import java.time.Instant;
import java.util.List;

public class KitchenOrderResponseDTO {
    private String id;
    private String userId;
    private String orderId;
    private String status;
    private List<KitchenOrderLineDTO> lines;
    private Instant createdAt;
    private Instant updatedAt;

    public KitchenOrderResponseDTO() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<KitchenOrderLineDTO> getLines() { return lines; }
    public void setLines(List<KitchenOrderLineDTO> lines) { this.lines = lines; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
