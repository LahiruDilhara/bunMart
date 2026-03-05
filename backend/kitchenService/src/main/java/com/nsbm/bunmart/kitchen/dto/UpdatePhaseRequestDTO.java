package com.nsbm.bunmart.kitchen.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class UpdatePhaseRequestDTO {

    @NotBlank
    private String phase; // PREPARING, BAKING, COMPLETED

    @Min(0) @Max(100)
    private int progressPercent;

    public UpdatePhaseRequestDTO() {}

    public String getPhase() { return phase; }
    public void setPhase(String phase) { this.phase = phase; }

    public int getProgressPercent() { return progressPercent; }
    public void setProgressPercent(int progressPercent) { this.progressPercent = progressPercent; }
}
