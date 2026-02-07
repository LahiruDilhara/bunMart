package com.nsbm.bunmart.cart.mappers.grpc;

import com.nsbm.bunmart.cart.model.Cart;
import com.nsbm.bunmart.cart.model.CartItem;
import com.nsbm.bunmart.cart.v1.AddCartItemResponse;
import com.nsbm.bunmart.cart.v1.CartInfo;
import com.nsbm.bunmart.cart.v1.CartItemInfo;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class GRPCMapper {
    public AddCartItemResponse cartToAddCartItemResponse(Cart cart) {
        return AddCartItemResponse.newBuilder()
                .setCartId(cart.getId().toString())
                .setCart(cartInfoFromCart(cart))
                .build();
    }

    public CartInfo cartInfoFromCart(Cart cart){
        int totalItemCount = cart.getCartItems().size();
        List<CartItemInfo> cartItemInfoList = cart.getCartItems().stream().map(this::cartItemToCartItemInfo).toList();
        return CartInfo.newBuilder()
                .setCartId(String.valueOf(cart.getId()))
                .setUserId(cart.getUserId())
                .setTotal(String.valueOf(totalItemCount))
                .addAllItems(cartItemInfoList)
                .build();
    }

    public CartItemInfo cartItemToCartItemInfo(CartItem cartItem){
        return CartItemInfo.newBuilder()
                .setCartItemId(String.valueOf(cartItem.getId()))
                .setProductId(cartItem.getProductId())
                .setQuantity(cartItem.getQuantity())
                .build();
    }

}
