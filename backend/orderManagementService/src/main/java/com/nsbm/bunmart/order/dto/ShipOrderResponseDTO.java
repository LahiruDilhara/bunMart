package com.nsbm.bunmart.order.dto;

public class ShipOrderResponseDTO {
    private String shipmentId;

    public ShipOrderResponseDTO() {
    }

    public ShipOrderResponseDTO(String shipmentId) {
        this.shipmentId = shipmentId;
    }

    public String getShipmentId() {
        return shipmentId;
    }

    public void setShipmentId(String shipmentId) {
        this.shipmentId = shipmentId;
    }
}
