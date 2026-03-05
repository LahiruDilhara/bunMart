package com.nsbm.bunmart.pricing.controller;

import com.nsbm.bunmart.pricing.dto.CalculatePriceRequestDTO;
import com.nsbm.bunmart.pricing.dto.CalculatePriceResponseDTO;
import com.nsbm.bunmart.pricing.dto.ProductPriceInfoDTO;
import com.nsbm.bunmart.pricing.dto.ProductPricesRequestDTO;
import com.nsbm.bunmart.pricing.services.PricingCalculationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/pricing")
@RequiredArgsConstructor
public class PricingController {

    private final PricingCalculationService pricingCalculationService;

    @PostMapping("/calculate")
    public ResponseEntity<CalculatePriceResponseDTO> calculate(@Valid @RequestBody CalculatePriceRequestDTO dto) {
        List<String> productIds = dto.getItems().stream()
                .map(CalculatePriceRequestDTO.LineItemDTO::getProductId)
                .collect(Collectors.toList());
        List<Integer> quantities = dto.getItems().stream()
                .map(CalculatePriceRequestDTO.LineItemDTO::getQuantity)
                .collect(Collectors.toList());
        CalculatePriceResponseDTO result = pricingCalculationService.calculate(productIds, quantities);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/product-prices")
    public ResponseEntity<List<ProductPriceInfoDTO>> getProductPrices(@Valid @RequestBody ProductPricesRequestDTO dto) {
        List<ProductPriceInfoDTO> result = pricingCalculationService.getProductPrices(dto.getProductIds());
        return ResponseEntity.ok(result);
    }
}
