package com.nsbm.bunmart.cart.dto;

import java.util.List;

public class CartResponseDTO {
    private Integer id;
    private String userId;
    private List<CartItemResponseDTO> cartItems;

    public CartResponseDTO(Integer id, String userId, List<CartItemResponseDTO> cartItems) {
        this.id = id;
        this.userId = userId;
        this.cartItems = cartItems;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<CartItemResponseDTO> getCartItems() {
        return cartItems;
    }

    public void setCartItems(List<CartItemResponseDTO> cartItems) {
        this.cartItems = cartItems;
    }
}
