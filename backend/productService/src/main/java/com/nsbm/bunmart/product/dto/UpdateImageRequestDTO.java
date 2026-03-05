package com.nsbm.bunmart.product.dto;

public class UpdateImageRequestDTO {
    private String imageBase64;

    public UpdateImageRequestDTO() {
    }

    public String getImageBase64() {
        return imageBase64;
    }

    public void setImageBase64(String imageBase64) {
        this.imageBase64 = imageBase64;
    }
}
