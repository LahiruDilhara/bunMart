package com.nsbm.bunmart.pricing.controller;

import com.nsbm.bunmart.pricing.dto.CreateProductRequestDTO;
import com.nsbm.bunmart.pricing.dto.ProductResponseDTO;
import com.nsbm.bunmart.pricing.dto.UpdateProductRequestDTO;
import com.nsbm.bunmart.pricing.mappers.rest.PricingMapper;
import com.nsbm.bunmart.pricing.model.Product;
import com.nsbm.bunmart.pricing.services.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/pricing/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final PricingMapper pricingMapper;

    @PostMapping
    public ResponseEntity<ProductResponseDTO> create(@Valid @RequestBody CreateProductRequestDTO dto) {
        Product p = productService.create(
                dto.getId(),
                dto.getName(),
                dto.getRawPrice(),
                dto.getTax(),
                dto.getShippingCost(),
                dto.getCurrencyCode()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(pricingMapper.toProductResponseDTO(p));
    }

    @GetMapping
    public List<ProductResponseDTO> getAll() {
        return productService.getAll().stream()
                .map(pricingMapper::toProductResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getById(@PathVariable String id) {
        Product p = productService.getById(id);
        return ResponseEntity.ok(pricingMapper.toProductResponseDTO(p));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> update(@PathVariable String id, @Valid @RequestBody UpdateProductRequestDTO dto) {
        Product p = productService.update(
                id,
                dto.getName(),
                dto.getRawPrice(),
                dto.getTax(),
                dto.getShippingCost(),
                dto.getCurrencyCode(),
                dto.getIsActive()
        );
        return ResponseEntity.ok(pricingMapper.toProductResponseDTO(p));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
