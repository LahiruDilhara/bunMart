package com.nsbm.bunmart.order.dto;

/**
 * DTO for updating order fields (e.g. from gRPC UpdateOrderRequest).
 * All fields are optional; only non-null, non-empty values are applied.
 */
public class UpdateOrderRequestDTO {
    private String status;
    private String paymentId;
    private String shippingAddress;
    private String shipmentId;

    public UpdateOrderRequestDTO() {
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getShipmentId() {
        return shipmentId;
    }

    public void setShipmentId(String shipmentId) {
        this.shipmentId = shipmentId;
    }
}
