package com.nsbm.bunmart.order.controller;

import com.nsbm.bunmart.order.dto.*;
import com.nsbm.bunmart.order.mappers.rest.OrderRestMapper;
import com.nsbm.bunmart.order.model.Order;
import com.nsbm.bunmart.order.services.OrderService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;
    private final OrderRestMapper orderRestMapper;

    public OrderController(OrderService orderService, OrderRestMapper orderRestMapper) {
        this.orderService = orderService;
        this.orderRestMapper = orderRestMapper;
    }

    @GetMapping
    public ResponseEntity<Page<OrderResponseDTO>> getOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "createdAt,desc") String sort,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {
        Page<OrderResponseDTO> result = orderService.getOrders(status, sort, page, size)
                .map(orderRestMapper::orderToDTO);
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<OrderResponseDTO> createOrder(@Valid @RequestBody CreateOrderRequestDTO request) {
        Order order = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(orderRestMapper.orderToDTO(order));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> getOrder(@PathVariable String id) {
        Order order = orderService.getOrder(id);
        return ResponseEntity.ok(orderRestMapper.orderToDTO(order));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponseDTO>> getOrdersByUser(@PathVariable String userId) {
        List<OrderResponseDTO> orders = orderService.getOrdersByUser(userId).stream()
                .map(orderRestMapper::orderToDTO)
                .toList();
        return ResponseEntity.ok(orders);
    }

    @PatchMapping("/{id}/shipping-address")
    public ResponseEntity<OrderResponseDTO> updateShippingAddress(
            @PathVariable String id,
            @Valid @RequestBody UpdateShippingAddressRequestDTO request) {
        Order order = orderService.updateShippingAddress(id, request.getShippingAddress());
        return ResponseEntity.ok(orderRestMapper.orderToDTO(order));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderResponseDTO> cancelOrder(@PathVariable String id) {
        Order order = orderService.cancelOrder(id);
        return ResponseEntity.ok(orderRestMapper.orderToDTO(order));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateOrderStatusRequestDTO request) {
        Order order = orderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok(orderRestMapper.orderToDTO(order));
    }

    @PutMapping("/{id}/shipment")
    public ResponseEntity<OrderResponseDTO> setShipmentId(
            @PathVariable String id,
            @RequestBody ShipmentIdRequestDTO request) {
        Order order = orderService.setShipmentId(id, request.getShipmentId());
        return ResponseEntity.ok(orderRestMapper.orderToDTO(order));
    }
}
