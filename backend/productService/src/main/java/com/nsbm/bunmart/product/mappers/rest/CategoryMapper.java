package com.nsbm.bunmart.product.mappers.rest;

import com.nsbm.bunmart.product.dto.CategoryResponseDTO;
import com.nsbm.bunmart.product.model.Category;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CategoryMapper {

    public CategoryResponseDTO categoryToCategoryResponseDTO(Category category) {
        if (category == null) {
            return null;
        }
        return new CategoryResponseDTO(
                category.getId(),
                category.getName(),
                category.getDescription());
    }

    public List<CategoryResponseDTO> categoriesToCategoryResponseDTOs(List<Category> categories) {
        if (categories == null) {
            return List.of();
        }
        return categories.stream()
                .map(this::categoryToCategoryResponseDTO)
                .collect(Collectors.toList());
    }
}
