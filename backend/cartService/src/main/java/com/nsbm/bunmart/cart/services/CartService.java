package com.nsbm.bunmart.cart.services;

import com.nsbm.bunmart.cart.errors.*;
import com.nsbm.bunmart.cart.model.Cart;
import com.nsbm.bunmart.cart.model.CartItem;
import com.nsbm.bunmart.cart.repositories.CartRepository;
import com.nsbm.bunmart.kitchen.v1.KitchenServiceGrpc;
import com.nsbm.bunmart.order.v1.CreateOrderIntentRequest;
import com.nsbm.bunmart.order.v1.OrderServiceGrpc;
import io.grpc.StatusRuntimeException;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class CartService {

    private final CartRepository cartRepository;

    @GrpcClient("orderService")
    private OrderServiceGrpc.OrderServiceBlockingStub orderStub;

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
        catch (DataAccessException e){
            log.error(e.getMessage());
            throw new CartNotSaved("The cart not saved");
        }
    }

    private void createCartIfNotExists(String userId) throws DatabaseException {
        try{
            if(cartRepository.existsByUserId(userId)){
                Cart cart = new Cart();
                cart.setUserId(userId);
                cartRepository.save(cart);
            }
        }
        catch (DataIntegrityViolationException e){
            throw new DuplicateCart("The cart already exists");
        }
        catch (DataAccessException e){
            throw new CartNotSaved("The cart not saved");
        }
    }

    public Cart getCart(String userId) {
        return cartRepository.findByUserId(userId).orElseThrow(() -> new CartNotExists(userId));
    }

    public void RemoveCartItems(String userId, List<String> productIds){
        Cart cart = getCart(userId);
        List<CartItem> cartItems = cart.getCartItems();
        cartItems.removeIf(cartItem -> productIds.contains(cartItem.getProductId()));
        cart.setCartItems(cartItems);

        try{
            cartRepository.save(cart);
        }
        catch (DataAccessException e){
            log.error(e.getMessage());
            throw new CartNotSaved("The cart not saved");
        }
    }

    public void RemoveCartItem(String userId, String productId){
        Cart cart = getCart(userId);
        List<CartItem> cartItems = cart.getCartItems();
        cartItems.stream().filter(cartItem->productId.equals(cartItem.getProductId())).findFirst().orElseThrow(()-> new CartItemNotExists("Cart Item not found"));
        cartItems.removeIf(cartItem -> cartItem.getProductId().equals(productId));

        try{
            cart.setCartItems(cartItems);
        }
        catch (DataAccessException e){
            log.error(e.getMessage());
            throw new CartNotSaved("The cart not saved");
        }
    }

    public void ClearCart(String userId){
        Cart cart = getCart(userId);
        cart.setCartItems(new ArrayList<>());
        try{
            cartRepository.save(cart);
        }
        catch (DataAccessException e){
            log.error(e.getMessage());
            throw new CartNotSaved("The cart not saved");
        }
    }

    public Cart UpdateCartItem(String userId, String productId, int quantity){
        Cart cart = getCart(userId);
        CartItem cartItem = cart.getCartItems()
                .stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() ->
                        new CartItemNotExists("CartItem not exists for id: " + productId)
                );
        cartItem.setQuantity(quantity);
        try{
            return cartRepository.save(cart);
        }
        catch (DataAccessException e){
            log.error(e.getMessage());
            throw new CartNotSaved("The cart not saved");
        }
    }

    public Cart AddCartItem(String userId, int quantity, String productId){
        Cart cart = getCart(userId);
        List<CartItem> cartItems = cart.getCartItems();
        if(cartItems.stream().anyMatch(cartItem -> cartItem.getProductId().equals(productId))){
            throw new DuplicateCartItem("Cart item already exists");
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
            throw new CartNotSaved("The cart not saved");
        }
    }

    public String checkout(String userId, List<String> productIds){
        Cart cart = getCart(userId);
        List<CartItem> cartItems = cart.getCartItems();
        List<CartItem> checkoutItems = cartItems.stream().filter(cartItem -> productIds.contains(cartItem.getProductId())).toList();
        List<CartItem> remainItems =  cartItems.stream().filter(cartItem -> !productIds.contains(cartItem.getProductId())).toList();

        List<CreateOrderIntentRequest.CartLine> cartLines = checkoutItems.stream().map(item -> CreateOrderIntentRequest.CartLine.newBuilder().setProductId(item.getProductId()).setQuantity(item.getQuantity()).build()).toList();
        CreateOrderIntentRequest createOrderIntentRequest = CreateOrderIntentRequest.newBuilder().setUserId(userId).setCartId(String.valueOf(cart.getId())).addAllItems(cartLines).build();

        String orderId = null;
        try{
            orderId = orderStub.createOrderIntent(createOrderIntentRequest).getOrderId();
        }
        catch (StatusRuntimeException e){
            throw new OrderServiceUnavailableException("Order service unavailable");
        }

        cart.setCartItems(remainItems);

        try{
            cartRepository.save(cart);
        }
        catch (DataAccessException e){
            throw new CartNotSaved("Error while saving cart for id: " + userId);
        }
        return orderId;
    }
}
