package com.nsbm.bunmart.cart.services;

import com.nsbm.bunmart.cart.errors.*;
import com.nsbm.bunmart.cart.model.Cart;
import com.nsbm.bunmart.cart.model.CartItem;
import com.nsbm.bunmart.cart.repositories.CartRepository;
import com.nsbm.bunmart.order.v1.CreateOrderIntentRequest;
import com.nsbm.bunmart.order.v1.OrderServiceGrpc;
import io.grpc.StatusRuntimeException;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
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
        catch (Exception e){
            log.error("addCartItem cart item info: {}", cart);
            throw new CartNotSaved("The cart not saved");
        }
    }

    private void createCartIfNotExists(String userId) throws DatabaseException {
        try{
            boolean exists = cartRepository.existsByUserId(userId);
            if (!exists){
                Cart cart = new Cart();
                cart.setUserId(userId);
                cartRepository.save(cart);
            }
        } catch (Exception e) {
            throw new CartNotSaved("Error while creating cart for id: " + userId);
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
        catch (Exception e){
            throw new CartNotSaved("Error while saving cart for id: " + userId);
        }
    }

    public void RemoveCartItem(String userId, String productId){
        Cart cart = getCart(userId);
        List<CartItem> cartItems = cart.getCartItems();
        if(cartItems.stream().noneMatch(cartItem -> cartItem.getProductId().equals(productId))){
            throw new CartItemNotExists("CartItem not exists for id: " + productId);
        }
        cartItems.removeIf(cartItem -> cartItem.getProductId().equals(productId));

        try{
            cart.setCartItems(cartItems);
        }
        catch (Exception e){
            throw new CartNotSaved("Error while saving cart for id: " + userId);
        }
    }

    public void ClearCart(String userId){
        Cart cart = getCart(userId);
        cart.setCartItems(new ArrayList<>());
        try{
            cartRepository.save(cart);
        }
        catch (Exception e){
            throw new CartNotSaved("Error while saving cart for id: " + userId);
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
        catch (Exception e){
            throw new CartNotSaved("Error while saving cart for id: " + userId);
        }
    }

    public Cart AddCartItem(String userId, int quantity, String productId){
        Cart cart = getCart(userId);
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
            throw new CartNotSaved("Error while saving cart for id: " + userId);
        }
    }

    public String checkout(String userId, List<String> productIds){
        Cart cart = getCart(userId);
        List<CartItem> cartItems = cart.getCartItems();
        List<CartItem> checkoutItems = cartItems.stream().filter(cartItem -> productIds.contains(cartItem.getProductId())).toList();
        List<CartItem> remainItems =  cartItems.stream().filter(cartItem -> !productIds.contains(cartItem.getProductId())).toList();

        List<CreateOrderIntentRequest.CartLine> cartLines = checkoutItems.stream().map(item -> CreateOrderIntentRequest.CartLine.newBuilder().setProductId(item.getProductId()).setQuantity(item.getQuantity()).build()).toList();
        CreateOrderIntentRequest createOrderIntentRequest = CreateOrderIntentRequest.newBuilder().setUserId(userId).setCartId(String.valueOf(cart.getId())).addAllItems(cartLines).build();
        String orderId = orderStub.createOrderIntent(createOrderIntentRequest).getOrderId();

        cart.setCartItems(remainItems);

        try{
            cartRepository.save(cart);
        }
        catch (StatusRuntimeException e){
            throw new OrderServiceUnavailableException("Order service unavailable");
        }
        catch (Exception e){
            throw new OrderServiceUnavailableException("Order service unavailable");
        }
        return orderId;
    }
}
