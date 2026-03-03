package com.nsbm.bunmart.order.services;

import com.nsbm.bunmart.cart.v1.CartServiceGrpc;
import com.nsbm.bunmart.cart.v1.InvalidateCartRequest;
import com.nsbm.bunmart.kitchen.v1.CreateProductionOrderRequest;
import com.nsbm.bunmart.kitchen.v1.CreateProductionOrderResponse;
import com.nsbm.bunmart.kitchen.v1.KitchenServiceGrpc;
import com.nsbm.bunmart.kitchen.v1.ProductionOrderLine;
import com.nsbm.bunmart.order.errors.*;
import com.nsbm.bunmart.order.model.Order;
import com.nsbm.bunmart.order.model.OrderLine;
import com.nsbm.bunmart.order.model.OrderNote;
import com.nsbm.bunmart.order.repositories.OrderRepository;
import com.nsbm.bunmart.order.v1.CreateOrderIntentRequest;
import com.nsbm.bunmart.payment.v1.CreatePaymentIntentRequest;
import com.nsbm.bunmart.payment.v1.CreatePaymentIntentResponse;
import com.nsbm.bunmart.payment.v1.PaymentServiceGrpc;
import com.nsbm.bunmart.pricing.v1.CalculateOrderPricingRequest;
import com.nsbm.bunmart.pricing.v1.CalculateOrderPricingResponse;
import com.nsbm.bunmart.pricing.v1.PricingServiceGrpc;
import com.nsbm.bunmart.shipping.v1.CreateShipmentRequest;
import com.nsbm.bunmart.shipping.v1.CreateShipmentResponse;
import com.nsbm.bunmart.shipping.v1.ShippingServiceGrpc;
import io.grpc.StatusRuntimeException;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;

  
    @GrpcClient("cartService")
    private CartServiceGrpc.CartServiceBlockingStub cartStub;

    @GrpcClient("pricingService")
    private PricingServiceGrpc.PricingServiceBlockingStub pricingStub;

    @GrpcClient("paymentService")
    private PaymentServiceGrpc.PaymentServiceBlockingStub paymentStub;

    @GrpcClient("kitchenService")
    private KitchenServiceGrpc.KitchenServiceBlockingStub kitchenStub;

    @GrpcClient("shippingService")
    private ShippingServiceGrpc.ShippingServiceBlockingStub shippingStub;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }


    public Order createOrderIntent(String userId,
            List<CreateOrderIntentRequest.CartLine> items,
            String cartId) {
        Order order = new Order();
        order.setUserId(userId);
        order.setStatus("PENDING");
        if (cartId != null && !cartId.isBlank()) {
            order.setCartId(cartId);
        }

     
        List<OrderLine> lines = items.stream().map(item -> {
            OrderLine line = new OrderLine();
            line.setProductId(item.getProductId());
            line.setQuantity(item.getQuantity());
            line.setOrder(order);
            return line;
        }).collect(Collectors.toCollection(ArrayList::new));

        order.setOrderLines(lines);

        Order saved;
        try {
            saved = orderRepository.save(order);
        } catch (DataAccessException e) {
            log.error("Failed to save order intent: {}", e.getMessage());
            throw new OrderNotSavedException("Order could not be saved");
        }

        // Invalidate only the ordered product_ids from the user's cart
        if (cartId != null && !cartId.isBlank()) {
            List<String> productIds = items.stream()
                    .map(CreateOrderIntentRequest.CartLine::getProductId)
                    .toList();
            try {
                cartStub.invalidateCart(
                        InvalidateCartRequest.newBuilder()
                                .setUserId(userId)
                                .addAllProductIds(productIds)
                                .build());
            } catch (StatusRuntimeException e) {
                log.warn("Cart invalidation failed (non-blocking): {}", e.getMessage());
                // Non-blocking - order creation still succeeds
            }
        }

        return saved;
    }

 

    public Order getOrder(Integer id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order not found for id: " + id));
    }

    public List<Order> getOrdersByUser(String userId) {
        return orderRepository.findByUserId(userId);
    }

   
   
    public Order updateOrderWithDetails(Integer id, List<String> couponCodes, String addressId) {
        Order order = getOrder(id);

        List<CalculateOrderPricingRequest.LineItem> lineItems = order.getOrderLines().stream()
                .map(line -> CalculateOrderPricingRequest.LineItem.newBuilder()
                        .setProductId(line.getProductId())
                        .setQuantity(line.getQuantity())
                        .build())
                .toList();

        CalculateOrderPricingRequest pricingRequest = CalculateOrderPricingRequest.newBuilder()
                .setUserId(order.getUserId())
                .addAllItems(lineItems)
                .addAllCouponCodes(couponCodes != null ? couponCodes : List.of())
                .build();

        CalculateOrderPricingResponse pricingResponse;
        try {
            pricingResponse = pricingStub.calculateOrderPricing(pricingRequest);
        } catch (StatusRuntimeException e) {
            log.error("Pricing service call failed: {}", e.getMessage());
            throw new PricingServiceUnavailableException("Pricing service unavailable");
        }

        // Update each order line with the pricing result
        pricingResponse.getLinesList().forEach(lineResult -> {
            order.getOrderLines().stream()
                    .filter(l -> l.getProductId().equals(lineResult.getProductId()))
                    .findFirst()
                    .ifPresent(l -> {
                        l.setUnitPrice(lineResult.getUnitPrice());
                        l.setLineTotal(lineResult.getLineTotal());
                    });
        });

        order.setSubtotal(pricingResponse.getSubtotal());
        order.setDiscountTotal(pricingResponse.getDiscountTotal());
        order.setTotal(pricingResponse.getTotal());
        order.setCurrencyCode(pricingResponse.getCurrencyCode());
        order.setShippingAddressId(addressId);

        if (couponCodes != null && !couponCodes.isEmpty()) {
            order.setCouponCodes(String.join(",", couponCodes));
        }

        try {
            return orderRepository.save(order);
        } catch (DataAccessException e) {
            log.error("Failed to update order: {}", e.getMessage());
            throw new OrderNotSavedException("Failed to update order with details");
        }
    }

    public CreatePaymentIntentResponse requestPaymentIntent(Integer id) {
        Order order = getOrder(id);

        if (!"PENDING".equals(order.getStatus())) {
            throw new InvalidOrderStateException(
                    "Order is not in PENDING state. Current state: " + order.getStatus());
        }

        String amount = order.getTotal() != null ? order.getTotal() : "0";
        String currency = order.getCurrencyCode() != null ? order.getCurrencyCode() : "USD";

        CreatePaymentIntentRequest request = CreatePaymentIntentRequest.newBuilder()
                .setOrderId(String.valueOf(order.getId()))
                .setAmount(amount)
                .setCurrencyCode(currency)
                .setUserId(order.getUserId())
                .setOrderName("BunMart Order #" + order.getId())
                .build();

        try {
            return paymentStub.createPaymentIntent(request);
        } catch (StatusRuntimeException e) {
            log.error("Payment service call failed: {}", e.getMessage());
            throw new PaymentServiceUnavailableException("Payment service unavailable");
        }
    }

 
    public Order markOrderPaid(Integer id) {
        Order order = getOrder(id);
        order.setStatus("PAID");
        return saveOrThrow(order);
    }

  
    public String produceOrder(Integer id) {
        Order order = getOrder(id);
        if (!"PAID".equals(order.getStatus())) {
            throw new InvalidOrderStateException(
                    "Order must be in PAID state to start production. Current: " + order.getStatus());
        }

        List<ProductionOrderLine> kitchenLines = order.getOrderLines().stream()
                .map(line -> ProductionOrderLine.newBuilder()
                        .setProductId(line.getProductId())
                        .setQuantity(line.getQuantity())
                        .build())
                .toList();

        CreateProductionOrderRequest kitchenRequest = CreateProductionOrderRequest.newBuilder()
                .setUserOrderId(String.valueOf(order.getId()))
                .addAllLines(kitchenLines)
                .build();

        CreateProductionOrderResponse kitchenResponse;
        try {
            kitchenResponse = kitchenStub.createProductionOrder(kitchenRequest);
        } catch (StatusRuntimeException e) {
            log.error("Kitchen service call failed: {}", e.getMessage());
            throw new KitchenServiceUnavailableException("Kitchen service unavailable");
        }

        String productionOrderId = kitchenResponse.getProductionOrderId();
        order.setProductionOrderId(productionOrderId);
        order.setStatus("PRODUCTION");
        saveOrThrow(order);

        return productionOrderId;
    }




    public void notifyOrderPrepared(String userOrderId) {
        Integer id = Integer.parseInt(userOrderId);
        Order order = getOrder(id);
        order.setStatus("PREPARED");
        saveOrThrow(order);
    }



    public Order updateOrderStatus(Integer id, String newStatus) {
        Order order = getOrder(id);
        order.setStatus(newStatus);
        return saveOrThrow(order);
    }

  
    public String shipOrder(Integer id) {
        Order order = getOrder(id);
        if (!"PACKED".equals(order.getStatus())) {
            throw new InvalidOrderStateException(
                    "Order must be PACKED before shipping. Current: " + order.getStatus());
        }

        List<String> productIds = order.getOrderLines().stream()
                .map(OrderLine::getProductId)
                .toList();

        CreateShipmentRequest shipRequest = CreateShipmentRequest.newBuilder()
                .setOrderId(String.valueOf(order.getId()))
                .setUserId(order.getUserId())
                .setShippingAddressId(order.getShippingAddressId() != null ? order.getShippingAddressId() : "")
                .addAllProductIds(productIds)
                .build();

        CreateShipmentResponse shipResponse;
        try {
            shipResponse = shippingStub.createShipment(shipRequest);
        } catch (StatusRuntimeException e) {
            log.error("Shipping service call failed: {}", e.getMessage());
            throw new ShippingServiceUnavailableException("Shipping service unavailable");
        }

        String shipmentId = shipResponse.getShipmentId();
        order.setShipmentId(shipmentId);
        saveOrThrow(order);

        return shipmentId;
    }



    public void setOrderShipping(String orderId) {
        Integer id = Integer.parseInt(orderId);
        Order order = getOrder(id);
        order.setStatus("SHIPPING");
        saveOrThrow(order);
    }

   


    public Order addOrderNote(Integer id, String noteText) {
        Order order = getOrder(id);
        OrderNote note = new OrderNote(noteText, order);
        order.getNotes().add(note);
        return saveOrThrow(order);
    }

    


    public Order cancelOrder(Integer id) {
        Order order = getOrder(id);
        if ("SHIPPING".equals(order.getStatus()) || "SHIPPED".equals(order.getStatus())) {
            throw new InvalidOrderStateException(
                    "Cannot cancel an order that is already shipping or shipped.");
        }
        order.setStatus("CANCELLED");
        return saveOrThrow(order);
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
