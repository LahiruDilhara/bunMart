package com.nsbm.bunmart.product.dto;

import java.util.List;

public class ProductResponseDTO {
    private String id;
    private String name;
    private String description;
    private List<String> tags;
    private String weight;
    private Boolean availability;
    private Integer categoryId;
    private boolean hasImage;

    public ProductResponseDTO() {
    }

    public ProductResponseDTO(String id, String name, String description, List<String> tags,
                            String weight, Boolean availability, Integer categoryId, boolean hasImage) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.tags = tags;
        this.weight = weight;
        this.availability = availability;
        this.categoryId = categoryId;
        this.hasImage = hasImage;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public String getWeight() {
        return weight;
    }

    public void setWeight(String weight) {
        this.weight = weight;
    }

    public Boolean getAvailability() {
        return availability;
    }

    public void setAvailability(Boolean availability) {
        this.availability = availability;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public boolean isHasImage() {
        return hasImage;
    }

    public void setHasImage(boolean hasImage) {
        this.hasImage = hasImage;
    }
}
