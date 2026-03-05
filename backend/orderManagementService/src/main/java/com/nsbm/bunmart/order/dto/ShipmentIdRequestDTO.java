package com.nsbm.bunmart.order.dto;

import jakarta.validation.constraints.NotBlank;

public class ShipmentIdRequestDTO {

    @NotBlank(message = "Shipment ID is required")
    private String shipmentId;

    public ShipmentIdRequestDTO() {
    }

    public String getShipmentId() {
        return shipmentId;
    }

    public void setShipmentId(String shipmentId) {
        this.shipmentId = shipmentId;
    }
}
