package com.nsbm.bunmart.product.dto;

public class ImageResponseDTO {
    private String imageBase64;

    public ImageResponseDTO() {
    }

    public ImageResponseDTO(String imageBase64) {
        this.imageBase64 = imageBase64;
    }

    public String getImageBase64() {
        return imageBase64;
    }

    public void setImageBase64(String imageBase64) {
        this.imageBase64 = imageBase64;
    }
}
