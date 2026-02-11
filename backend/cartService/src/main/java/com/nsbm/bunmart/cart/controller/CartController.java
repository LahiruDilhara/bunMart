package com.nsbm.bunmart.cart.controller;

import com.nsbm.bunmart.cart.dto.CartResponseDTO;
import com.nsbm.bunmart.cart.errors.CartItemNotExists;
import com.nsbm.bunmart.cart.errors.CartNotExists;
import com.nsbm.bunmart.cart.errors.DatabaseException;
import com.nsbm.bunmart.cart.mappers.rest.CartMapper;
import com.nsbm.bunmart.cart.model.Cart;
import com.nsbm.bunmart.cart.services.CartService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@Slf4j
@RestController
@RequestMapping(("/api/v1/cart"))
public class CartController {
    private final CartMapper cartMapper;
    private final CartService cartService;

    public CartController(CartMapper cartMapper, CartService cartService) {
        this.cartMapper = cartMapper;
        this.cartService = cartService;
    }

    @GetMapping("/")
    public ResponseEntity<CartResponseDTO> getCart(@RequestParam String userId) {
        try {
            Cart cart = cartService.getCart(userId);
            return ResponseEntity.status(HttpStatus.OK).body(cartMapper.cartToCartResponseDTO(cart));
        }
        catch (CartNotExists e) {
            log.error(e.getMessage());
            return  ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        catch (DatabaseException e) {
            log.error(e.getMessage());
            return  ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
        catch (Exception e) {
            log.error("invalidateCart error",e);
            return  ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/item/{itemId}")
    public ResponseEntity<Void> deleteCartItem(@RequestParam String userId,@PathVariable int itemId){
        try {
            cartService.RemoveCartItem(userId,itemId);
            return ResponseEntity.status(HttpStatus.OK).body(null);
        }
        catch (CartItemNotExists e) {
            log.error(e.getMessage());
            return  ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        catch (DatabaseException e){
            log.error(e.getMessage());
            return  ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
        catch (Exception e) {
            log.error("invalidateCart error",e);
            return  ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/item")
    public ResponseEntity<Void> clearCart(@RequestParam String userId) {
        try {
            cartService.ClearCart(userId);
            return ResponseEntity.status(HttpStatus.OK).body(null);
        }
        catch (CartItemNotExists e) {
            log.error(e.getMessage());
            return  ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        catch (DatabaseException e){
            log.error(e.getMessage());
            return  ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
        catch (Exception e) {
            log.error("invalidateCart error",e);
            return  ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PatchMapping("/item/{itemId}")
    public ResponseEntity<CartResponseDTO> updateCartItem(@RequestParam String userId,@RequestParam int quantity,@PathVariable int itemId){
        try {
            Cart cart = cartService.UpdateCartItem(userId,itemId,quantity);
            return ResponseEntity.status(HttpStatus.OK).body(cartMapper.cartToCartResponseDTO(cart));
        }
        catch (CartItemNotExists e) {
            log.error(e.getMessage());
            return  ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        catch (DatabaseException e){
            log.error(e.getMessage());
            return  ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
        catch (Exception e) {
            log.error("invalidateCart error",e);
            return  ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/item")
    public ResponseEntity<CartResponseDTO> addCartItem(@RequestParam String userId,@RequestParam int quantity,@RequestParam String productId){
        try{
            Cart cart = cartService.addCartItem(userId,productId,quantity);
            return ResponseEntity.status(HttpStatus.OK).body(cartMapper.cartToCartResponseDTO(cart));
        }
        catch (CartItemNotExists e) {
            log.error(e.getMessage());
            return  ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        catch (DatabaseException e){
            log.error(e.getMessage());
            return  ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
        catch (Exception e) {
            log.error("invalidateCart error",e);
            return  ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
