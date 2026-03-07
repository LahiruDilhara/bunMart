package com.nsbm.bunmart.cart.services;

import com.nsbm.bunmart.cart.errors.*;
import com.nsbm.bunmart.cart.model.Cart;
import com.nsbm.bunmart.cart.model.CartItem;
import com.nsbm.bunmart.cart.repositories.CartRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@Transactional
public class CartService {

    private final CartRepository cartRepository;

    public CartService(CartRepository cartRepository){
        this.cartRepository = cartRepository;
    }

    public Cart addCartItem(String userId, String productId, int quantity) throws CartNotExistsException, CartNotSavedException, DuplicateCartException {
        createCartIfNotExists(userId);
        Cart cart = getCart(userId);
        List<CartItem> cartItems = cart.getCartItems();
        if(cartItems.stream().anyMatch(cartItem -> cartItem.getProductId().equals(productId))){
            throw new DuplicateCartItemException("Cart item already exists");
        }
        CartItem cartItem = new CartItem();
        cartItem.setProductId(productId);
        cartItem.setQuantity(quantity);
        cartItem.setCart(cart);

        cartItems.add(cartItem);
        cart.setCartItems(cartItems);

        try{
            return cartRepository.save(cart);
        }
        catch (DataAccessException e){
            log.error(e.getMessage());
            throw new CartNotSavedException("The cart not saved");
        }
    }

    private void createCartIfNotExists(String userId) throws DuplicateCartException, CartNotSavedException {
        try{
            if(!cartRepository.existsByUserId(userId)){
                Cart cart = new Cart();
                cart.setUserId(userId);
                cartRepository.save(cart);
            }
        }
        catch (DataIntegrityViolationException e){
            throw new DuplicateCartException("The cart already exists");
        }
        catch (DataAccessException e){
            throw new CartNotSavedException("The cart not saved");
        }
    }

    public Cart getCart(String userId) throws CartNotExistsException {
        return cartRepository.findByUserId(userId).orElseThrow(() -> new CartNotExistsException(userId));
    }

    public void RemoveCartItems(String userId, List<String> productIds) throws CartNotExistsException, CartNotSavedException {
        Cart cart = getCart(userId);
        List<CartItem> cartItems = cart.getCartItems();
        cartItems.removeIf(cartItem -> productIds.contains(cartItem.getProductId()));
        cart.setCartItems(cartItems);

        try{
            cartRepository.save(cart);
        }
        catch (DataAccessException e){
            log.error(e.getMessage());
            throw new CartNotSavedException("The cart not saved");
        }
    }

    public void RemoveCartItem(String userId, String productId) throws CartNotExistsException, CartNotSavedException, CartItemNotExistsException {
        Cart cart = getCart(userId);
        List<CartItem> cartItems = cart.getCartItems();
        cartItems.forEach(item -> {log.info("productId : "+item.getProductId());});
        cartItems.stream().filter(cartItem->productId.equals(cartItem.getProductId())).findFirst().orElseThrow(()-> new CartItemNotExistsException("Cart Item not found"));
        cartItems.removeIf(cartItem -> cartItem.getProductId().equals(productId));

        try{
            cart.setCartItems(cartItems);
        }
        catch (DataAccessException e){
            log.error(e.getMessage());
            throw new CartNotSavedException("The cart not saved");
        }
    }

    public void ClearCart(String userId)throws CartNotExistsException, CartNotSavedException {
        Cart cart = getCart(userId);
        cart.getCartItems().clear();
        try{
            cartRepository.save(cart);
        }
        catch (DataAccessException e){
            log.error(e.getMessage());
            throw new CartNotSavedException("The cart not saved");
        }
    }

    public Cart UpdateCartItem(String userId, String productId, int quantity) throws CartNotExistsException, CartNotSavedException, CartItemNotExistsException {
        Cart cart = getCart(userId);
        CartItem cartItem = cart.getCartItems()
                .stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() ->
                        new CartItemNotExistsException("CartItem not exists for id: " + productId)
                );
        cartItem.setQuantity(quantity);
        try{
            return cartRepository.save(cart);
        }
        catch (DataAccessException e){
            log.error(e.getMessage());
            throw new CartNotSavedException("The cart not saved");
        }
    }
}
