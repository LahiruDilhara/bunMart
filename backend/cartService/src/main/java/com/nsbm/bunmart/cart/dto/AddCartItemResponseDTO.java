package com.nsbm.bunmart.cart.dto;

public class AddCartItemResponseDTO {

    private String cartId;

    public AddCartItemResponseDTO(String cartId) {
        this.cartId = cartId;
    }

    public AddCartItemResponseDTO() {
    }

    public String getCartId() {
        return cartId;
    }

    public void setCartId(String cartId) {
        this.cartId = cartId;
    }
}
