package com.nsbm.bunmart.cart.services;

import com.nsbm.bunmart.cart.errors.CartNotExists;
import com.nsbm.bunmart.cart.errors.DatabaseException;
import com.nsbm.bunmart.cart.model.Cart;
import com.nsbm.bunmart.cart.model.CartItem;
import com.nsbm.bunmart.cart.repositories.CartRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class CartService {

    private final CartRepository cartRepository;

    public CartService(CartRepository cartRepository){
        this.cartRepository = cartRepository;
    }

    public Cart addCartItem(String userId, String productId, int quantity) throws CartNotExists, DatabaseException{
        createCartIfNotExists(userId);
        Cart cart = cartRepository.findByUserId(userId).orElseThrow(()-> new CartNotExists(userId));

        CartItem cartItem = new CartItem();
        cartItem.setProductId(productId);
        cartItem.setQuantity(quantity);
        cartItem.setCart(cart);

        List<CartItem> cartItems = cart.getCartItems();
        cartItems.add(cartItem);
        cart.setCartItems(cartItems);

        try{
            return cartRepository.save(cart);
        }
        catch (Exception e){
            log.error("addCartItem cart item info: {}", cart);
            throw new DatabaseException(e.getMessage());
        }
    }

    private void createCartIfNotExists(String userId) throws DatabaseException {
        try{
            log.info("createCartIfNotExists userId:{}",userId);
            boolean exists = cartRepository.existsByUserId(userId);
            log.info("cart exists: {}", exists);
            if (!exists){
                Cart cart = new Cart();
                cart.setUserId(userId);
                cartRepository.save(cart);
            }
        } catch (Exception e) {
            throw new DatabaseException("Error while creating cart for id: " + userId);
        }
    }

    public Cart getCart(String userId) {
        return cartRepository.findByUserId(userId).orElseThrow(() -> new CartNotExists(userId));
    }

    public void RemoveCartItems(String userId, List<String> productIds){
        try{
            Cart cart =  cartRepository.findByUserId(userId).orElseThrow(() -> new CartNotExists(userId));
            List<CartItem> cartItems = cart.getCartItems();
            cartItems.removeIf(cartItem -> productIds.contains(cartItem.getProductId()));
            cart.setCartItems(cartItems);
            cartRepository.save(cart);
        }
        catch (Exception e){
            log.error("removeCartItems error: {}", e.getMessage());
            throw new DatabaseException(e.getMessage());
        }
    }
}
