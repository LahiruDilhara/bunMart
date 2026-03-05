package com.nsbm.bunmart.pricing.controller;

import com.nsbm.bunmart.pricing.dto.CreateDiscountRequestDTO;
import com.nsbm.bunmart.pricing.dto.DiscountResponseDTO;
import com.nsbm.bunmart.pricing.dto.UpdateDiscountRequestDTO;
import com.nsbm.bunmart.pricing.mappers.rest.PricingMapper;
import com.nsbm.bunmart.pricing.model.Discount;
import com.nsbm.bunmart.pricing.services.DiscountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/pricing/discounts")
@RequiredArgsConstructor
public class DiscountController {

    private final DiscountService discountService;
    private final PricingMapper pricingMapper;

    @PostMapping
    public ResponseEntity<DiscountResponseDTO> create(@Valid @RequestBody CreateDiscountRequestDTO dto) {
        Discount d = discountService.create(
                dto.getProductId(),
                dto.getMinQuantity(),
                dto.getType(),
                dto.getValue(),
                dto.getDescription()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(pricingMapper.toDiscountResponseDTO(d));
    }

    @GetMapping
    public List<DiscountResponseDTO> getAll() {
        return discountService.getAll().stream()
                .map(pricingMapper::toDiscountResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiscountResponseDTO> getById(@PathVariable Long id) {
        Discount d = discountService.getById(id);
        return ResponseEntity.ok(pricingMapper.toDiscountResponseDTO(d));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiscountResponseDTO> update(@PathVariable Long id, @Valid @RequestBody UpdateDiscountRequestDTO dto) {
        Discount d = discountService.update(
                id,
                dto.getProductId(),
                dto.getMinQuantity(),
                dto.getType(),
                dto.getValue(),
                dto.getDescription(),
                dto.getIsActive()
        );
        return ResponseEntity.ok(pricingMapper.toDiscountResponseDTO(d));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        discountService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
