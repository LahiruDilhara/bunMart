package com.nsbm.bunmart.kitchen.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class UpdateLineProgressRequestDTO {

    @NotNull(message = "Progress is required")
    @Min(0) @Max(100)
    private Integer progress;

    public Integer getProgress() { return progress; }
    public void setProgress(Integer progress) { this.progress = progress; }
}
