package com.nsbm.bunmart.order.controller;

import com.nsbm.bunmart.order.dto.*;
import com.nsbm.bunmart.order.mappers.rest.OrderRestMapper;
import com.nsbm.bunmart.order.model.Order;
import com.nsbm.bunmart.order.services.OrderService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for the Order Management Service.
 * Exposes endpoints consumed by the frontend (not by other backend services —
 * those use gRPC).
 *
 * Base path: /api/v1/orders
 */
@Slf4j
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final OrderRestMapper orderRestMapper;

    public OrderController(OrderService orderService, OrderRestMapper orderRestMapper) {
        this.orderService = orderService;
        this.orderRestMapper = orderRestMapper;
    }

    @GetMapping("/test")
    public String test() {
        return "Order controller working 🚀";
    }

    /**
     * GET /api/v1/orders/{id}
     * Frontend calls this with the order intent id returned from checkout.
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> getOrder(@PathVariable String id) {
        Order order = orderService.getOrder(id);
        return ResponseEntity.ok(orderRestMapper.orderToDTO(order));
    }

    /**
     * GET /api/v1/orders/user/{userId}
     * Returns all orders for a user (order history).
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponseDTO>> getOrdersByUser(@PathVariable String userId) {
        List<OrderResponseDTO> orders = orderService.getOrdersByUser(userId)
                .stream()
                .map(orderRestMapper::orderToDTO)
                .toList();
        return ResponseEntity.ok(orders);
    }

    /**
     * PUT /api/v1/orders/{id}/details
     * Frontend sends coupon codes + selected delivery address id from the order
     * page.
     * Order service calls Pricing gRPC internally and builds the full order.
     */
    @PutMapping("/{id}/details")
    public ResponseEntity<OrderResponseDTO> updateOrderWithDetails(
            @PathVariable String id,
            @Valid @RequestBody UpdateOrderDetailsRequestDTO requestDTO) {
        Order order = orderService.updateOrderWithDetails(
                id,
                requestDTO.getCouponCodes(),
                requestDTO.getAddressId());
        return ResponseEntity.ok(orderRestMapper.orderToDTO(order));
    }

    /**
     * POST /api/v1/orders/{id}/payment
     * User presses Pay. Order service calls Payment gRPC and returns payment intent
     * details.
     * Frontend uses the paymentIntentId + clientSecret with Stripe Elements.
     */
    @PostMapping("/{id}/payment")
    public ResponseEntity<PaymentIntentResponseDTO> requestPaymentIntent(@PathVariable String id) {
        var paymentResponse = orderService.requestPaymentIntent(id);
        PaymentIntentResponseDTO dto = new PaymentIntentResponseDTO(
                paymentResponse.getPaymentId(),
                paymentResponse.getClientSecret(),
                paymentResponse.getStatus());
        return ResponseEntity.ok(dto);
    }

    /**
     * POST /api/v1/orders/{id}/paid
     * Called after successful Stripe webhook confirming payment.
     * Marks the order as PAID so it becomes eligible for production.
     */
    @PostMapping("/{id}/paid")
    public ResponseEntity<OrderResponseDTO> markOrderPaid(@PathVariable String id) {
        Order order = orderService.markOrderPaid(id);
        return ResponseEntity.ok(orderRestMapper.orderToDTO(order));
    }

    /**
     * POST /api/v1/orders/{id}/produce
     * Admin triggers kitchen production.
     * Order service calls Kitchen gRPC and returns the production order id.
     */
    @PostMapping("/{id}/produce")
    public ResponseEntity<ProduceOrderResponseDTO> produceOrder(@PathVariable String id) {
        String productionOrderId = orderService.produceOrder(id);
        return ResponseEntity.ok(new ProduceOrderResponseDTO(productionOrderId));
    }

    /**
     * PUT /api/v1/orders/{id}/status
     * Admin manually updates order status (e.g. set to PACKED after packing).
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateOrderStatusRequestDTO requestDTO) {
        Order order = orderService.updateOrderStatus(id, requestDTO.getStatus());
        return ResponseEntity.ok(orderRestMapper.orderToDTO(order));
    }

    /**
     * POST /api/v1/orders/{id}/ship
     * Admin triggers shipping. Order service calls Shipping gRPC and returns the
     * shipment id.
     */
    @PostMapping("/{id}/ship")
    public ResponseEntity<ShipOrderResponseDTO> shipOrder(@PathVariable String id) {
        String shipmentId = orderService.shipOrder(id);
        return ResponseEntity.ok(new ShipOrderResponseDTO(shipmentId));
    }

    /**
     * POST /api/v1/orders/{id}/notes
     * Add a note to an order.
     */
    @PostMapping("/{id}/notes")
    public ResponseEntity<OrderResponseDTO> addNote(
            @PathVariable String id,
            @Valid @RequestBody OrderNoteRequestDTO noteRequestDTO) {
        Order order = orderService.addOrderNote(id, noteRequestDTO.getNote());
        return ResponseEntity.ok(orderRestMapper.orderToDTO(order));
    }

    /**
     * DELETE /api/v1/orders/{id}
     * Cancel/archive an order. Returns 409 if order is already shipping or shipped.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> cancelOrder(@PathVariable String id) {
        Order order = orderService.cancelOrder(id);
        return ResponseEntity.status(HttpStatus.OK).body(orderRestMapper.orderToDTO(order));
    }
}
