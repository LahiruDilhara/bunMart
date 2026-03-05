package com.nsbm.bunmart.shipping.controller;

import com.nsbm.bunmart.shipping.dto.CreateShippingPackageRequestDTO;
import com.nsbm.bunmart.shipping.dto.ShippingPackageResponseDTO;
import com.nsbm.bunmart.shipping.dto.UpdateProgressRequestDTO;
import com.nsbm.bunmart.shipping.mappers.rest.ShippingMapper;
import com.nsbm.bunmart.shipping.model.ShippingPackage;
import com.nsbm.bunmart.shipping.services.ShippingPackageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/shipping/shipping-packages")
public class ShippingPackageController {

    private final ShippingPackageService shippingPackageService;
    private final ShippingMapper shippingMapper;

    public ShippingPackageController(ShippingPackageService shippingPackageService, ShippingMapper shippingMapper) {
        this.shippingPackageService = shippingPackageService;
        this.shippingMapper = shippingMapper;
    }

    @PostMapping
    public ResponseEntity<ShippingPackageResponseDTO> addShippingPackage(@Valid @RequestBody CreateShippingPackageRequestDTO dto) {
        ShippingPackage pkg = shippingPackageService.createShippingPackage(
                dto.getWeight(),
                dto.getDestinationAddress(),
                dto.getSourceAddress(),
                dto.getTotalPrice(),
                dto.getOrderId(),
                dto.getDriverId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(shippingMapper.toShippingPackageResponseDTO(pkg));
    }

    @GetMapping
    public List<ShippingPackageResponseDTO> getAllShippingPackages() {
        return shippingPackageService.getAllShippingPackages().stream()
                .map(shippingMapper::toShippingPackageResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShippingPackageResponseDTO> getShippingPackage(@PathVariable String id) {
        ShippingPackage pkg = shippingPackageService.getShippingPackage(id);
        return ResponseEntity.ok(shippingMapper.toShippingPackageResponseDTO(pkg));
    }

    @GetMapping("/by-order/{orderId}")
    public List<ShippingPackageResponseDTO> getByOrderId(@PathVariable String orderId) {
        return shippingPackageService.getShippingPackagesByOrderId(orderId).stream()
                .map(shippingMapper::toShippingPackageResponseDTO)
                .collect(Collectors.toList());
    }

    @PatchMapping("/{id}/progress")
    public ResponseEntity<ShippingPackageResponseDTO> updateProgress(@PathVariable String id,
                                                                       @Valid @RequestBody UpdateProgressRequestDTO dto) {
        ShippingPackage pkg = shippingPackageService.updateProgress(id, dto.getProgress());
        return ResponseEntity.ok(shippingMapper.toShippingPackageResponseDTO(pkg));
    }

    @PatchMapping("/{id}/stop")
    public ResponseEntity<ShippingPackageResponseDTO> stopShipping(@PathVariable String id) {
        ShippingPackage pkg = shippingPackageService.stopShipping(id);
        return ResponseEntity.ok(shippingMapper.toShippingPackageResponseDTO(pkg));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShippingPackage(@PathVariable String id) {
        shippingPackageService.deleteShippingPackage(id);
        return ResponseEntity.noContent().build();
    }
}
