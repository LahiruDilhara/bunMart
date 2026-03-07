package com.nsbm.bunmart.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class CreateOrderRequestDTO {

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    /** Order contains products; each product has productId and quantity. */
    @NotEmpty(message = "At least one product is required")
    @Valid
    private List<OrderProductDTO> products;

    @NotBlank(message = "Subtotal is required")
    private String subtotal;

    private String discountTotal;

    private String shippingTotal;

    private String taxTotal;

    @NotBlank(message = "Total is required")
    private String total;

    private String currencyCode;

    public CreateOrderRequestDTO() {
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public List<OrderProductDTO> getProducts() {
        return products;
    }

    public void setProducts(List<OrderProductDTO> products) {
        this.products = products;
    }

    public String getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(String subtotal) {
        this.subtotal = subtotal;
    }

    public String getDiscountTotal() {
        return discountTotal;
    }

    public void setDiscountTotal(String discountTotal) {
        this.discountTotal = discountTotal;
    }

    public String getShippingTotal() {
        return shippingTotal;
    }

    public void setShippingTotal(String shippingTotal) {
        this.shippingTotal = shippingTotal;
    }

    public String getTaxTotal() {
        return taxTotal;
    }

    public void setTaxTotal(String taxTotal) {
        this.taxTotal = taxTotal;
    }

    public String getTotal() {
        return total;
    }

    public void setTotal(String total) {
        this.total = total;
    }

    public String getCurrencyCode() {
        return currencyCode;
    }

    public void setCurrencyCode(String currencyCode) {
        this.currencyCode = currencyCode;
    }
}
