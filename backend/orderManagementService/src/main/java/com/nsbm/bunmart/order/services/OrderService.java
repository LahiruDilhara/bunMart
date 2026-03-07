package com.nsbm.bunmart.order.services;

import com.nsbm.bunmart.cart.v1.CartServiceGrpc;
import com.nsbm.bunmart.cart.v1.RemoveCartItemsRequest;
import com.nsbm.bunmart.notification.v1.NotificationServiceGrpc;
import com.nsbm.bunmart.notification.v1.SendNotificationRequest;
import com.nsbm.bunmart.order.dto.CreateOrderRequestDTO;
import com.nsbm.bunmart.order.dto.OrderProductDTO;
import com.nsbm.bunmart.order.dto.UpdateOrderRequestDTO;
import com.nsbm.bunmart.order.errors.*;
import com.nsbm.bunmart.order.model.Order;
import com.nsbm.bunmart.order.model.OrderProduct;
import com.nsbm.bunmart.order.model.OrderStatus;
import com.nsbm.bunmart.order.repositories.OrderRepository;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
@Slf4j
@Service
@Transactional
public class OrderService {

    @GrpcClient("cartService")
    private CartServiceGrpc.CartServiceBlockingStub cartServiceStub;

    @GrpcClient("notificationService")
    private NotificationServiceGrpc.NotificationServiceBlockingStub notificationServiceStub;

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public Order createOrder(CreateOrderRequestDTO request) {
        if (request.getProducts() == null || request.getProducts().isEmpty()) {
            throw new InvalidOrderStateException("At least one product is required");
        }
        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setShippingAddress(request.getShippingAddress());
        order.setStatus(OrderStatus.PENDING.getValue());
        order.setSubtotal(request.getSubtotal());
        order.setDiscountTotal(request.getDiscountTotal() != null ? request.getDiscountTotal() : "0");
        order.setShippingTotal(request.getShippingTotal() != null ? request.getShippingTotal() : "0");
        order.setTaxTotal(request.getTaxTotal() != null ? request.getTaxTotal() : "0");
        order.setTotal(request.getTotal());
        order.setCurrencyCode(request.getCurrencyCode() != null ? request.getCurrencyCode() : "USD");

        List<OrderProduct> orderProducts = request.getProducts().stream()
                .map(p -> {
                    OrderProduct op = new OrderProduct(p.getProductId(), p.getQuantity());
                    op.setOrder(order);
                    return op;
                })
                .collect(Collectors.toList());
        order.setProducts(orderProducts);

        try {
            Order saved = orderRepository.save(order);
            removeOrderedItemsFromCart(saved.getUserId(), saved.getProducts().stream()
                    .map(OrderProduct::getProductId)
                    .collect(Collectors.toList()));
            return saved;
        } catch (DataAccessException e) {
            log.error("Failed to save order: {}", e.getMessage());
            throw new OrderNotSavedException("Order could not be saved");
        }
    }

    /**
     * Calls cart service via gRPC to remove the ordered product IDs from the user's cart.
     * Best-effort: failures are logged but do not fail order creation.
     */
    private void removeOrderedItemsFromCart(String userId, List<String> productIds) {
        if (productIds == null || productIds.isEmpty()) return;
        try {
            RemoveCartItemsRequest request = RemoveCartItemsRequest.newBuilder()
                    .setUserId(userId)
                    .addAllProductIds(productIds)
                    .build();
            cartServiceStub.removeCartItems(request);
            log.info("Removed {} product(s) from cart for user {}", productIds.size(), userId);
        } catch (Exception e) {
            log.warn("Failed to remove ordered items from cart for user {}: {}", userId, e.getMessage());
        }
    }

    private void notifyOrderShipped(String userId, String orderId) {
        try {
            SendNotificationRequest req = SendNotificationRequest.newBuilder()
                    .setUserId(userId)
                    .setChannel("IN_APP")
                    .setTemplateId("1")
                    .putTemplateData("title", "Order shipped")
                    .putTemplateData("message", "Your order #" + orderId + " has been shipped.")
                    .setSubject("Order shipped")
                    .setReferenceType("ORDER")
                    .setReferenceId(orderId != null ? orderId : "")
                    .build();
            notificationServiceStub.sendNotification(req);
            log.info("Notified user {} that order {} has been shipped", userId, orderId);
        } catch (Exception e) {
            log.warn("Failed to send order-shipped notification: {}", e.getMessage());
        }
    }

    public Order getOrder(String id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order not found for id: " + id));
    }

    /**
     * Returns the order if it exists and belongs to the given user (for gRPC GetOrder).
     */
    public Order getOrderForUser(String userId, String orderId) {
        Order order = getOrder(orderId);
        if (!order.getUserId().equals(userId)) {
            throw new OrderNotFoundException("Order not found for id: " + orderId);
        }
        return order;
    }

    public List<Order> getOrdersByUser(String userId) {
        return orderRepository.findByUserId(userId);
    }

    /**
     * Administrative listing: optional status filter, sort, and pagination.
     *
     * @param status optional; if present must be valid (e.g. pending, confirmed, cancelled).
     * @param sort   optional; format "property,direction" e.g. "createdAt,desc" or "updatedAt,asc". Allowed properties: id, userId, status, total, createdAt, updatedAt. Default "createdAt,desc".
     * @param page   zero-based page index.
     * @param size   page size (capped at 100).
     */
    public Page<Order> getOrders(String status, String sort, int page, int size) {
        Sort orderSort = parseSort(sort);
        int safeSize = Math.min(Math.max(1, size), 100);
        Pageable pageable = PageRequest.of(page, safeSize, orderSort);

        if (status != null && !status.isBlank()) {
            String normalized = normalizeStatus(status);
            if (!OrderStatus.isValid(normalized)) {
                throw new InvalidOrderStateException("Invalid order status for filter: " + status);
            }
            return orderRepository.findByStatus(normalized, pageable);
        }
        return orderRepository.findAll(pageable);
    }

    private static Sort parseSort(String sortParam) {
        if (sortParam == null || sortParam.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        String[] parts = sortParam.trim().split(",");
        String property = parts[0].trim();
        if (property.isEmpty()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        String[] allowed = { "id", "userId", "status", "total", "createdAt", "updatedAt" };
        boolean allowedProperty = false;
        for (String a : allowed) {
            if (a.equalsIgnoreCase(property)) {
                property = a;
                allowedProperty = true;
                break;
            }
        }
        if (!allowedProperty) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        Sort.Direction direction = Sort.Direction.DESC;
        if (parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim())) {
            direction = Sort.Direction.ASC;
        }
        return Sort.by(direction, property);
    }

    public Order updateShippingAddress(String id, String shippingAddress) {
        Order order = getOrder(id);
        if (!OrderStatus.canUpdateShippingAddress(order.getStatus())) {
            throw new InvalidOrderStateException(
                    "Shipping address can only be updated when order is pending or await_payment. Current: " + order.getStatus());
        }
        order.setShippingAddress(shippingAddress);
        order.setUpdatedAt(java.time.LocalDateTime.now());
        return saveOrThrow(order);
    }

    public Order cancelOrder(String id) {
        Order order = getOrder(id);
        if (!OrderStatus.canCancel(order.getStatus())) {
            throw new InvalidOrderStateException(
                    "Order cannot be cancelled in current state: " + order.getStatus());
        }
        order.setStatus(OrderStatus.CANCELLED.getValue());
        order.setUpdatedAt(java.time.LocalDateTime.now());
        return saveOrThrow(order);
    }

    public Order updateOrderStatus(String id, String newStatus) {
        Order order = getOrder(id);
        if (!OrderStatus.isValid(newStatus)) {
            throw new InvalidOrderStateException("Invalid order status: " + newStatus);
        }
        order.setStatus(normalizeStatus(newStatus));
        order.setUpdatedAt(java.time.LocalDateTime.now());
        Order saved = saveOrThrow(order);
        if (OrderStatus.SHIPPED.getValue().equals(saved.getStatus())) {
            notifyOrderShipped(saved.getUserId(), saved.getId());
        }
        return saved;
    }

    public Order setShipmentId(String id, String shipmentId) {
        Order order = getOrder(id);
        order.setShipmentId(shipmentId);
        order.setUpdatedAt(java.time.LocalDateTime.now());
        return saveOrThrow(order);
    }

    public Order setPaymentId(String id, String paymentId) {
        Order order = getOrder(id);
        order.setPaymentId(paymentId);
        order.setUpdatedAt(java.time.LocalDateTime.now());
        return saveOrThrow(order);
    }

    /**
     * Updates order with only the non-empty fields from the DTO (e.g. from gRPC UpdateOrder).
     * Validates status via OrderStatus; shipping address only if order is in an updatable state.
     */
    public Order updateOrder(String orderId, String userId, UpdateOrderRequestDTO dto) {
        Order order = getOrderForUser(userId, orderId);
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            if (!OrderStatus.isValid(dto.getStatus())) {
                throw new InvalidOrderStateException("Invalid order status: " + dto.getStatus());
            }
            order.setStatus(normalizeStatus(dto.getStatus()));
        }
        if (dto.getPaymentId() != null && !dto.getPaymentId().isBlank()) {
            order.setPaymentId(dto.getPaymentId());
        }
        if (dto.getShipmentId() != null && !dto.getShipmentId().isBlank()) {
            order.setShipmentId(dto.getShipmentId());
        }
        if (dto.getShippingAddress() != null && !dto.getShippingAddress().isBlank()) {
            if (!OrderStatus.canUpdateShippingAddress(order.getStatus())) {
                throw new InvalidOrderStateException(
                        "Shipping address can only be updated when order is pending or await_payment. Current: " + order.getStatus());
            }
            order.setShippingAddress(dto.getShippingAddress());
        }
        order.setUpdatedAt(java.time.LocalDateTime.now());
        return saveOrThrow(order);
    }

    private static String normalizeStatus(String status) {
        if (status == null || status.isBlank()) return status;
        return status.trim().toLowerCase().replace("-", "_");
    }

    private Order saveOrThrow(Order order) {
        try {
            return orderRepository.save(order);
        } catch (DataAccessException e) {
            log.error("Failed to save order: {}", e.getMessage());
            throw new OrderNotSavedException("Order could not be saved");
        }
    }
}
