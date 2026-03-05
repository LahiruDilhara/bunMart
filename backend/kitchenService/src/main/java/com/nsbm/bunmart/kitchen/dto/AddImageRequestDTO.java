package com.nsbm.bunmart.kitchen.dto;

import jakarta.validation.constraints.NotBlank;

public class AddImageRequestDTO {

    @NotBlank
    private String imageUrl;

    public AddImageRequestDTO() {}

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
