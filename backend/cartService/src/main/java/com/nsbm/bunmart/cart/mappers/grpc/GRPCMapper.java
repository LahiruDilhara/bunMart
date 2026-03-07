package com.nsbm.bunmart.cart.mappers.grpc;

import com.nsbm.bunmart.cart.model.Cart;
import com.nsbm.bunmart.cart.model.CartItem;
import com.nsbm.bunmart.cart.v1.CartInfo;
import com.nsbm.bunmart.cart.v1.CartItemInfo;
import com.nsbm.bunmart.cart.v1.GetCartResponse;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Maps between cart domain models and cart proto messages.
 */
@Component
public class GRPCMapper {

    public GetCartResponse toGetCartResponse(Cart cart) {
        return GetCartResponse.newBuilder()
                .setCart(toCartInfo(cart))
                .build();
    }

    public CartInfo toCartInfo(Cart cart) {
        List<CartItemInfo> items = cart.getCartItems().stream()
                .map(this::toCartItemInfo)
                .toList();
        return CartInfo.newBuilder()
                .setCartId(String.valueOf(cart.getId()))
                .setUserId(cart.getUserId())
                .addAllItems(items)
                .build();
    }

    public CartItemInfo toCartItemInfo(CartItem cartItem) {
        return CartItemInfo.newBuilder()
                .setItemId(String.valueOf(cartItem.getId()))
                .setProductId(cartItem.getProductId())
                .setQuantity(cartItem.getQuantity())
                .build();
    }
}
