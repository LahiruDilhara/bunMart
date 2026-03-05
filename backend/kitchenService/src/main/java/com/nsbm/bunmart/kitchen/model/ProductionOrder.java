package com.nsbm.bunmart.kitchen.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "production_order")
public class ProductionOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String userOrderId;

    @Column(nullable = false)
    private String phase; // PREPARING, BAKING, COMPLETED

    @Column(nullable = false)
    private int progressPercent;

    @Column(length = 2000)
    private String notes;

    private Instant createdAt;
    private Instant updatedAt;

    @OneToMany(mappedBy = "productionOrder", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<ProductionLine> lines = new ArrayList<>();

    @OneToMany(mappedBy = "productionOrder", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<PreparationImage> images = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public ProductionOrder() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserOrderId() { return userOrderId; }
    public void setUserOrderId(String userOrderId) { this.userOrderId = userOrderId; }

    public String getPhase() { return phase; }
    public void setPhase(String phase) { this.phase = phase; }

    public int getProgressPercent() { return progressPercent; }
    public void setProgressPercent(int progressPercent) { this.progressPercent = progressPercent; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public List<ProductionLine> getLines() { return lines; }
    public void setLines(List<ProductionLine> lines) { this.lines = lines; }

    public List<PreparationImage> getImages() { return images; }
    public void setImages(List<PreparationImage> images) { this.images = images; }
}
