package com.nsbm.bunmart.product.controller;

import com.nsbm.bunmart.product.dto.AddCategoryRequestDTO;
import com.nsbm.bunmart.product.dto.CategoryResponseDTO;
import com.nsbm.bunmart.product.mappers.rest.CategoryMapper;
import com.nsbm.bunmart.product.model.Category;
import com.nsbm.bunmart.product.services.ProductService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final ProductService productService;
    private final CategoryMapper categoryMapper;

    public CategoryController(ProductService productService, CategoryMapper categoryMapper) {
        this.productService = productService;
        this.categoryMapper = categoryMapper;
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponseDTO>> getCategories() {
        List<Category> categories = productService.getCategories();
        return ResponseEntity.ok(categoryMapper.categoriesToCategoryResponseDTOs(categories));
    }

    @PostMapping
    public ResponseEntity<CategoryResponseDTO> addCategory(@Valid @RequestBody AddCategoryRequestDTO request) {
        Category category = productService.addCategory(
                request.getName(),
                request.getDescription());
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryMapper.categoryToCategoryResponseDTO(category));
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Integer categoryId) {
        productService.deleteCategory(categoryId);
        return ResponseEntity.noContent().build();
    }
}
