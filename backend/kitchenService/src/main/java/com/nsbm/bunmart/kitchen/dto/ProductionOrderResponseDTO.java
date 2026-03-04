package com.nsbm.bunmart.kitchen.dto;

import java.time.Instant;
import java.util.List;

public class ProductionOrderResponseDTO {
    private String id;
    private String userOrderId;
    private String phase;
    private int progressPercent;
    private String notes;
    private List<ProductionLineDTO> lines;
    private List<ImageDTO> images;
    private Instant createdAt;
    private Instant updatedAt;

    public ProductionOrderResponseDTO() {}

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

    public List<ProductionLineDTO> getLines() { return lines; }
    public void setLines(List<ProductionLineDTO> lines) { this.lines = lines; }

    public List<ImageDTO> getImages() { return images; }
    public void setImages(List<ImageDTO> images) { this.images = images; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
