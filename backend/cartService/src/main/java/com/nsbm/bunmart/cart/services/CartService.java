package com.nsbm.bunmart.cart.services;

import com.nsbm.bunmart.cart.repositories.CartRepository;
import org.springframework.stereotype.Service;

@Service
public class CartService {

    private CartRepository cartRepository;

    public CartService(CartRepository cartRepository){
        this.cartRepository = cartRepository;
    }


}
