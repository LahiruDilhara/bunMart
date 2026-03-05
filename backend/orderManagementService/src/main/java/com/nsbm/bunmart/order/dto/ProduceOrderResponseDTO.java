package com.nsbm.bunmart.order.dto;

public class ProduceOrderResponseDTO {
    private String productionOrderId;

    public ProduceOrderResponseDTO() {
    }

    public ProduceOrderResponseDTO(String productionOrderId) {
        this.productionOrderId = productionOrderId;
    }

    public String getProductionOrderId() {
        return productionOrderId;
    }

    public void setProductionOrderId(String productionOrderId) {
        this.productionOrderId = productionOrderId;
    }
}
