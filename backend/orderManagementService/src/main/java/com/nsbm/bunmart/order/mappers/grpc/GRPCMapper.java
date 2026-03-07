package com.nsbm.bunmart.order.mappers.grpc;

import com.nsbm.bunmart.order.dto.UpdateOrderRequestDTO;
import com.nsbm.bunmart.order.model.Order;
import com.nsbm.bunmart.order.model.OrderProduct;
import com.nsbm.bunmart.order.v1.*;
import com.google.protobuf.Timestamp;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

/**
 * Maps between order domain models/DTOs and order proto messages.
 */
@Component
public class GRPCMapper {

    public GetOrderResponse toGetOrderResponse(Order order) {
        return GetOrderResponse.newBuilder()
                .setOrder(toOrderInfo(order))
                .build();
    }

    public UpdateOrderResponse toUpdateOrderResponse(Order order) {
        return UpdateOrderResponse.newBuilder()
                .setOrder(toOrderInfo(order))
                .build();
    }

    public OrderInfo toOrderInfo(Order order) {
        OrderInfo.Builder builder = OrderInfo.newBuilder()
                .setOrderId(order.getId())
                .setUserId(order.getUserId())
                .setStatus(order.getStatus() != null ? order.getStatus() : "")
                .addAllLines(order.getProducts() != null
                        ? order.getProducts().stream().map(this::toOrderLineInfo).toList()
                        : List.of());
        if (order.getSubtotal() != null) builder.setSubtotal(order.getSubtotal());
        if (order.getDiscountTotal() != null) builder.setDiscountTotal(order.getDiscountTotal());
        if (order.getShippingTotal() != null) builder.setShippingTotal(order.getShippingTotal());
        if (order.getTotal() != null) builder.setTotal(order.getTotal());
        if (order.getCurrencyCode() != null) builder.setCurrencyCode(order.getCurrencyCode());
        if (order.getShippingAddress() != null) builder.setShippingAddress(order.getShippingAddress());
        if (order.getShipmentId() != null) builder.setShipmentId(order.getShipmentId());
        if (order.getPaymentId() != null) builder.setPaymentId(order.getPaymentId());
        if (order.getCreatedAt() != null) builder.setCreatedAt(toTimestamp(order.getCreatedAt()));
        if (order.getUpdatedAt() != null) builder.setUpdatedAt(toTimestamp(order.getUpdatedAt()));
        return builder.build();
    }

    public OrderLineInfo toOrderLineInfo(OrderProduct product) {
        return OrderLineInfo.newBuilder()
                .setProductId(product.getProductId())
                .setQuantity(product.getQuantity() != null ? product.getQuantity() : 0)
                .build();
    }

    public UpdateOrderRequestDTO toUpdateOrderRequestDTO(UpdateOrderRequest request) {
        UpdateOrderRequestDTO dto = new UpdateOrderRequestDTO();
        if (!request.getStatus().isBlank()) dto.setStatus(request.getStatus());
        if (!request.getPaymentId().isBlank()) dto.setPaymentId(request.getPaymentId());
        if (!request.getShippingAddress().isBlank()) dto.setShippingAddress(request.getShippingAddress());
        if (!request.getShipmentId().isBlank()) dto.setShipmentId(request.getShipmentId());
        return dto;
    }

    private static Timestamp toTimestamp(LocalDateTime dateTime) {
        return Timestamp.newBuilder()
                .setSeconds(dateTime.toInstant(ZoneOffset.UTC).getEpochSecond())
                .setNanos(dateTime.getNano())
                .build();
    }
}
