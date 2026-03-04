package com.nsbm.bunmart.order.mappers.grpc;

import com.nsbm.bunmart.order.model.Order;
import com.nsbm.bunmart.order.model.OrderLine;
import com.nsbm.bunmart.order.v1.*;
import com.google.protobuf.Timestamp;
import org.springframework.stereotype.Component;

import java.time.ZoneOffset;

@Component
public class OrderGrpcMapper {

    private Timestamp toTimestamp(java.time.LocalDateTime ldt) {
        if (ldt == null)
            return Timestamp.getDefaultInstance();
        java.time.Instant instant = ldt.toInstant(ZoneOffset.UTC);
        return Timestamp.newBuilder()
                .setSeconds(instant.getEpochSecond())
                .setNanos(instant.getNano())
                .build();
    }

    public OrderLineInfo orderLineToGrpc(OrderLine line) {
        OrderLineInfo.Builder b = OrderLineInfo.newBuilder()
                .setProductId(line.getProductId())
                .setQuantity(line.getQuantity());
        if (line.getUnitPrice() != null)
            b.setUnitPrice(line.getUnitPrice());
        if (line.getLineTotal() != null)
            b.setLineTotal(line.getLineTotal());
        return b.build();
    }

    public OrderInfo orderToGrpcOrderInfo(Order order) {
        OrderInfo.Builder b = OrderInfo.newBuilder()
                .setOrderId(String.valueOf(order.getId()))
                .setUserId(order.getUserId())
                .setStatus(order.getStatus());

        order.getOrderLines().forEach(line -> b.addLines(orderLineToGrpc(line)));

        if (order.getSubtotal() != null)
            b.setSubtotal(order.getSubtotal());
        if (order.getDiscountTotal() != null)
            b.setDiscountTotal(order.getDiscountTotal());
        if (order.getShippingTotal() != null)
            b.setShippingTotal(order.getShippingTotal());
        if (order.getTotal() != null)
            b.setTotal(order.getTotal());
        if (order.getCurrencyCode() != null)
            b.setCurrencyCode(order.getCurrencyCode());
        if (order.getShippingAddressId() != null)
            b.setShippingAddressId(order.getShippingAddressId());

        b.setCreatedAt(toTimestamp(order.getCreatedAt()));
        b.setUpdatedAt(toTimestamp(order.getUpdatedAt()));

        return b.build();
    }

    public GetOrderResponse orderToGetOrderResponse(Order order) {
        return GetOrderResponse.newBuilder()
                .setOrder(orderToGrpcOrderInfo(order))
                .build();
    }

    public GetOrderStatusResponse orderToGetOrderStatusResponse(Order order) {
        return GetOrderStatusResponse.newBuilder()
                .setOrderId(String.valueOf(order.getId()))
                .setStatus(order.getStatus())
                .setUpdatedAt(toTimestamp(order.getUpdatedAt()))
                .build();
    }

    public UpdateOrderWithDetailsResponse orderToUpdateOrderWithDetailsResponse(Order order) {
        return UpdateOrderWithDetailsResponse.newBuilder()
                .setOrder(orderToGrpcOrderInfo(order))
                .build();
    }
}
