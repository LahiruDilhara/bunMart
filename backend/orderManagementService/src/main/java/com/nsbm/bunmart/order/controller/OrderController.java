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
        return "Order controller working ";
    }


    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> getOrder(@PathVariable String id) {
        Order order = orderService.getOrder(id);
        return ResponseEntity.ok(orderRestMapper.orderToDTO(order));
    }


    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponseDTO>> getOrdersByUser(@PathVariable String userId) {
        List<OrderResponseDTO> orders = orderService.getOrdersByUser(userId)
                .stream()
                .map(orderRestMapper::orderToDTO)
                .toList();
        return ResponseEntity.ok(orders);
    }


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


    @PostMapping("/{id}/payment")
    public ResponseEntity<PaymentIntentResponseDTO> requestPaymentIntent(@PathVariable String id) {
        var paymentResponse = orderService.requestPaymentIntent(id);
        PaymentIntentResponseDTO dto = new PaymentIntentResponseDTO(
                paymentResponse.getPaymentId(),
                paymentResponse.getClientSecret(),
                paymentResponse.getStatus());
        return ResponseEntity.ok(dto);
    }


    @PostMapping("/{id}/paid")
    public ResponseEntity<OrderResponseDTO> markOrderPaid(@PathVariable String id) {
        Order order = orderService.markOrderPaid(id);
        return ResponseEntity.ok(orderRestMapper.orderToDTO(order));
    }


    @PostMapping("/{id}/produce")
    public ResponseEntity<ProduceOrderResponseDTO> produceOrder(@PathVariable String id) {
        String productionOrderId = orderService.produceOrder(id);
        return ResponseEntity.ok(new ProduceOrderResponseDTO(productionOrderId));
    }


    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateOrderStatusRequestDTO requestDTO) {
        Order order = orderService.updateOrderStatus(id, requestDTO.getStatus());
        return ResponseEntity.ok(orderRestMapper.orderToDTO(order));
    }


    @PostMapping("/{id}/ship")
    public ResponseEntity<ShipOrderResponseDTO> shipOrder(@PathVariable String id) {
        String shipmentId = orderService.shipOrder(id);
        return ResponseEntity.ok(new ShipOrderResponseDTO(shipmentId));
    }


    @PostMapping("/{id}/notes")
    public ResponseEntity<OrderResponseDTO> addNote(
            @PathVariable String id,
            @Valid @RequestBody OrderNoteRequestDTO noteRequestDTO) {
        Order order = orderService.addOrderNote(id, noteRequestDTO.getNote());
        return ResponseEntity.ok(orderRestMapper.orderToDTO(order));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> cancelOrder(@PathVariable String id) {
        Order order = orderService.cancelOrder(id);
        return ResponseEntity.status(HttpStatus.OK).body(orderRestMapper.orderToDTO(order));
    }
}
