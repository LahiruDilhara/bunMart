package com.nsbm.bunmart.kitchen.dto;

public class KitchenOrderLineDTO {
    private String id;
    private String productId;
    private int quantity;
    private int progress;
    private String status;

    public KitchenOrderLineDTO() {}

    public KitchenOrderLineDTO(String id, String productId, int quantity, int progress, String status) {
        this.id = id;
        this.productId = productId;
        this.quantity = quantity;
        this.progress = progress;
        this.status = status;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
