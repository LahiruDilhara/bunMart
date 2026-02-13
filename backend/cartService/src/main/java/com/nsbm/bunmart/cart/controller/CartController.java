package com.nsbm.bunmart.cart.controller;

import com.nsbm.bunmart.cart.dto.*;
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
@RequestMapping("/api/v1/cart")
public class CartController {
    private final CartMapper cartMapper;
    private final CartService cartService;

    public CartController(CartMapper cartMapper, CartService cartService) {
        this.cartMapper = cartMapper;
        this.cartService = cartService;
    }

    @GetMapping("/")
    public ResponseEntity<CartResponseDTO> getCart(@RequestParam String userId) {
            Cart cart = cartService.getCart(userId);
            return ResponseEntity.status(HttpStatus.OK).body(cartMapper.cartToCartResponseDTO(cart));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Void> deleteCartItem(@RequestParam String userId,@PathVariable String productId){
            cartService.RemoveCartItem(userId,productId);
            return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    @DeleteMapping("/items")
    public ResponseEntity<Void> clearCart(@RequestParam String userId) {
            cartService.ClearCart(userId);
            return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    @PatchMapping("/items/{productId}")
    public ResponseEntity<CartResponseDTO> updateCartItem(@RequestParam String userId,@Valid @RequestBody UpdateCartItemRequestDTO updateCartItemRequestDTO,@PathVariable String productId){
            Cart cart = cartService.UpdateCartItem(userId,productId,updateCartItemRequestDTO.getQuantity());
            return ResponseEntity.status(HttpStatus.OK).body(cartMapper.cartToCartResponseDTO(cart));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponseDTO> addCartItem(@RequestParam String userId,@RequestBody AddCartItemRequestDTO addCartItemRequestDTO){
            Cart cart = cartService.addCartItem(userId,addCartItemRequestDTO.getProductId(),addCartItemRequestDTO.getQuantity());
            return ResponseEntity.status(HttpStatus.OK).body(cartMapper.cartToCartResponseDTO(cart));
    }

    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponseDTO> checkout(@RequestParam String userId, @Valid @RequestBody CheckoutRequestDTO checkoutRequestDTO){
            String orderId = cartService.checkout(userId,checkoutRequestDTO.getProductIds());
            return ResponseEntity.status(HttpStatus.OK).body(new CheckoutResponseDTO(orderId));
    }
}
