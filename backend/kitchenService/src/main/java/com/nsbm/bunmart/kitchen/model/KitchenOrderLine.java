package com.nsbm.bunmart.kitchen.model;

import jakarta.persistence.*;

@Entity
@Table(name = "kitchen_order_line")
public class KitchenOrderLine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "product_id", nullable = false)
    private String productId;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private int progress; // 0-100

    @Column(nullable = false)
    private String status; // PENDING, IN_PROGRESS, DONE

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kitchen_order_id", nullable = false)
    private KitchenOrder kitchenOrder;

    @PrePersist
    public void prePersist() {
        if (this.progress < 0) this.progress = 0;
        if (this.status == null) this.status = "PENDING";
    }

    public KitchenOrderLine() {}

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

    public KitchenOrder getKitchenOrder() { return kitchenOrder; }
    public void setKitchenOrder(KitchenOrder kitchenOrder) { this.kitchenOrder = kitchenOrder; }
}
