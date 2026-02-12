package com.nsbm.bunmart.cart.controller;

import com.nsbm.bunmart.cart.dto.CartResponseDTO;
import com.nsbm.bunmart.cart.dto.CheckoutRequestDTO;
import com.nsbm.bunmart.cart.dto.CheckoutResponseDTO;
import com.nsbm.bunmart.cart.errors.CartItemNotExistsException;
import com.nsbm.bunmart.cart.errors.CartNotExistsException;
import com.nsbm.bunmart.cart.errors.DatabaseExceptionException;
import com.nsbm.bunmart.cart.mappers.rest.CartMapper;
import com.nsbm.bunmart.cart.model.Cart;
import com.nsbm.bunmart.cart.services.CartService;
import jakarta.validation.Valid;
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
        catch (CartNotExistsException e) {
            log.error(e.getMessage());
            return  ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        catch (DatabaseExceptionException e) {
            log.error(e.getMessage());
            return  ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
        catch (Exception e) {
            log.error("invalidateCart error",e);
            return  ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/item/{itemId}")
    public ResponseEntity<Void> deleteCartItem(@RequestParam String userId,@PathVariable String productId){
        try {
            cartService.RemoveCartItem(userId,productId);
            return ResponseEntity.status(HttpStatus.OK).body(null);
        }
        catch (CartItemNotExistsException e) {
            log.error(e.getMessage());
            return  ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        catch (DatabaseExceptionException e){
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
        catch (CartItemNotExistsException e) {
            log.error(e.getMessage());
            return  ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        catch (DatabaseExceptionException e){
            log.error(e.getMessage());
            return  ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
        catch (Exception e) {
            log.error("invalidateCart error",e);
            return  ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PatchMapping("/item/{itemId}")
    public ResponseEntity<CartResponseDTO> updateCartItem(@RequestParam String userId,@RequestParam int quantity,@PathVariable String productId){
        try {
            Cart cart = cartService.UpdateCartItem(userId,productId,quantity);
            return ResponseEntity.status(HttpStatus.OK).body(cartMapper.cartToCartResponseDTO(cart));
        }
        catch (CartItemNotExistsException e) {
            log.error(e.getMessage());
            return  ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        catch (DatabaseExceptionException e){
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
        catch (CartItemNotExistsException e) {
            log.error(e.getMessage());
            return  ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        catch (DatabaseExceptionException e){
            log.error(e.getMessage());
            return  ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
        catch (Exception e) {
            log.error("invalidateCart error",e);
            return  ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("checkout")
    public ResponseEntity<CheckoutResponseDTO> checkout(@RequestParam String userId, @Valid @RequestBody CheckoutRequestDTO checkoutRequestDTO){
        try{
            String orderId = cartService.checkout(userId,checkoutRequestDTO.getProductIds());
            return ResponseEntity.status(HttpStatus.OK).body(new CheckoutResponseDTO(orderId));
        }
        catch (CartItemNotExistsException e) {
            log.error(e.getMessage());
            return  ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        catch (DatabaseExceptionException e){
            log.error(e.getMessage());
            return  ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
        catch (Exception e) {
            log.error("invalidateCart error",e);
            return  ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
