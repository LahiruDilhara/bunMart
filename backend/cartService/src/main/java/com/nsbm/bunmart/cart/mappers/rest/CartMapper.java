package com.nsbm.bunmart.cart.mappers.rest;

import com.nsbm.bunmart.cart.dto.CartItemResponseDTO;
import com.nsbm.bunmart.cart.dto.CartResponseDTO;
import com.nsbm.bunmart.cart.model.Cart;
import com.nsbm.bunmart.cart.model.CartItem;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class CartMapper {
    public CartItemResponseDTO cartItemToCartItemResponseDTO(CartItem cartItem) {
        return new CartItemResponseDTO(cartItem.getId(),cartItem.getProductId(),cartItem.getQuantity());
    }

    public CartResponseDTO cartToCartResponseDTO(Cart cart) {
        List<CartItemResponseDTO> cartItemResponseDTOList = cart.getCartItems().stream().map(this::cartItemToCartItemResponseDTO).toList();
        return new CartResponseDTO(cart.getId(),cart.getUserId(),cartItemResponseDTOList);
    }
}
