package com.nsbm.bunmart.shipping.mappers.grpc;

import com.nsbm.bunmart.shipping.dto.CreateShippingPackageRequestDTO;
import com.nsbm.bunmart.shipping.model.ShippingPackage;
import com.nsbm.bunmart.shipping.v1.*;
import com.google.protobuf.Timestamp;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Maps between shipping domain models/DTOs and shipping proto messages.
 */
@Component
public class GRPCMapper {

    public CreateShippingPackageRequestDTO toCreateShippingPackageRequestDTO(CreateShippingPackageRequest request) {
        CreateShippingPackageRequestDTO dto = new CreateShippingPackageRequestDTO();
        dto.setWeight(request.getWeight());
        dto.setDestinationAddress(request.getDestinationAddress());
        dto.setSourceAddress(request.getSourceAddress());
        dto.setTotalPrice(new BigDecimal(request.getTotalPrice() != null && !request.getTotalPrice().isBlank() ? request.getTotalPrice() : "0"));
        dto.setOrderId(request.getOrderId());
        if (request.getDriverId() != null && !request.getDriverId().isBlank()) {
            try {
                dto.setDriverId(Integer.parseInt(request.getDriverId()));
            } catch (NumberFormatException ignored) {
                dto.setDriverId(null);
            }
        }
        return dto;
    }

    public CreateShippingPackageResponse toCreateShippingPackageResponse(ShippingPackage pkg) {
        return CreateShippingPackageResponse.newBuilder()
                .setShippingPackageId(pkg.getId())
                .setStatus(pkg.getStatus() != null ? pkg.getStatus().name() : "CREATED")
                .build();
    }

    public GetShippingPackageResponse toGetShippingPackageResponse(ShippingPackage pkg) {
        GetShippingPackageResponse.Builder builder = GetShippingPackageResponse.newBuilder()
                .setShippingPackageId(pkg.getId())
                .setOrderId(pkg.getOrderId() != null ? pkg.getOrderId() : "")
                .setWeight(pkg.getWeight() != null ? pkg.getWeight() : 0.0)
                .setDestinationAddress(pkg.getDestinationAddress() != null ? pkg.getDestinationAddress() : "")
                .setSourceAddress(pkg.getSourceAddress() != null ? pkg.getSourceAddress() : "")
                .setTotalPrice(pkg.getTotalPrice() != null ? pkg.getTotalPrice().toPlainString() : "0")
                .setProgress(pkg.getProgress() != null ? pkg.getProgress() : 0)
                .setStatus(pkg.getStatus() != null ? pkg.getStatus().name() : "CREATED");
        if (pkg.getDriver() != null && pkg.getDriver().getId() != null) {
            builder.setDriverId(String.valueOf(pkg.getDriver().getId()));
        }
        if (pkg.getShippedAt() != null) {
            builder.setShippedAt(toTimestamp(pkg.getShippedAt()));
            builder.setUpdatedAt(toTimestamp(pkg.getShippedAt()));
        }
        return builder.build();
    }

    public UpdateShippingPackageStatusResponse toUpdateShippingPackageStatusResponse(boolean updated) {
        return UpdateShippingPackageStatusResponse.newBuilder().setUpdated(updated).build();
    }

    private static Timestamp toTimestamp(Instant instant) {
        return Timestamp.newBuilder()
                .setSeconds(instant.getEpochSecond())
                .setNanos(instant.getNano())
                .build();
    }
}
