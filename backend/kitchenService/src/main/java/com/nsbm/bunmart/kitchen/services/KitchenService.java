package com.nsbm.bunmart.kitchen.services;

import com.nsbm.bunmart.kitchen.dto.CreateKitchenOrderRequestDTO;
import com.nsbm.bunmart.kitchen.errors.DuplicateOrderIdException;
import com.nsbm.bunmart.kitchen.errors.KitchenOrderLineNotFoundException;
import com.nsbm.bunmart.kitchen.errors.KitchenOrderNotFoundException;
import com.nsbm.bunmart.kitchen.errors.KitchenOrderNotSavedException;
import com.nsbm.bunmart.kitchen.errors.LinesNotDoneException;
import com.nsbm.bunmart.kitchen.model.KitchenOrder;
import com.nsbm.bunmart.kitchen.model.KitchenOrderLine;
import com.nsbm.bunmart.kitchen.repositories.KitchenOrderRepository;
import com.nsbm.bunmart.notification.v1.NotificationServiceGrpc;
import com.nsbm.bunmart.notification.v1.SendNotificationRequest;
import com.nsbm.bunmart.order.v1.OrderServiceGrpc;
import com.nsbm.bunmart.order.v1.UpdateOrderRequest;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@Transactional
public class KitchenService {

    @GrpcClient("notificationService")
    private NotificationServiceGrpc.NotificationServiceBlockingStub notificationServiceStub;

    @GrpcClient("orderService")
    private OrderServiceGrpc.OrderServiceBlockingStub orderServiceStub;

    private final KitchenOrderRepository kitchenOrderRepository;

    public KitchenService(KitchenOrderRepository kitchenOrderRepository) {
        this.kitchenOrderRepository = kitchenOrderRepository;
    }

    public KitchenOrder createKitchenOrder(String userId, String orderId, List<CreateKitchenOrderRequestDTO.LineItemDTO> lines) {
        if (!kitchenOrderRepository.findByOrderId(orderId).isEmpty()) {
            throw new DuplicateOrderIdException("A kitchen order already exists for orderId: " + orderId);
        }
        KitchenOrder order = new KitchenOrder();
        order.setUserId(userId);
        order.setOrderId(orderId);
        order.setStatus("ACTIVE");

        for (CreateKitchenOrderRequestDTO.LineItemDTO item : lines) {
            KitchenOrderLine line = new KitchenOrderLine();
            line.setProductId(item.getProductId());
            line.setQuantity(item.getQuantity());
            line.setProgress(0);
            line.setStatus("PENDING");
            line.setKitchenOrder(order);
            order.getLines().add(line);
        }

        try {
            KitchenOrder saved = kitchenOrderRepository.save(order);
            notifyOrderSentToKitchen(saved.getUserId(), saved.getOrderId());
            return saved;
        } catch (DataAccessException e) {
            log.error("Failed to save kitchen order: {}", e.getMessage());
            throw new KitchenOrderNotSavedException("Failed to create kitchen order");
        }
    }

    private void notifyOrderSentToKitchen(String userId, String orderId) {
        try {
            SendNotificationRequest req = SendNotificationRequest.newBuilder()
                    .setUserId(userId)
                    .setChannel("IN_APP")
                    .setTemplateId("1")
                    .putTemplateData("title", "Order sent to kitchen")
                    .putTemplateData("message", "Your order #" + orderId + " has been sent to the kitchen.")
                    .setSubject("Order sent to kitchen")
                    .setReferenceType("ORDER")
                    .setReferenceId(orderId != null ? orderId : "")
                    .build();
            notificationServiceStub.sendNotification(req);
            log.info("Notified user {} that order {} was sent to kitchen", userId, orderId);
        } catch (Exception e) {
            log.warn("Failed to send order-to-kitchen notification: {}", e.getMessage());
        }
    }

    public KitchenOrder getKitchenOrder(String id) {
        return kitchenOrderRepository.findById(id)
                .orElseThrow(() -> new KitchenOrderNotFoundException("Kitchen order not found: " + id));
    }

    public List<KitchenOrder> getAllKitchenOrders() {
        return kitchenOrderRepository.findAll();
    }

    public List<KitchenOrder> getKitchenOrdersByOrderId(String orderId) {
        return kitchenOrderRepository.findByOrderId(orderId);
    }

    public KitchenOrder updateKitchenOrder(String id, String userId, String orderId) {
        KitchenOrder order = getKitchenOrder(id);
        if (!orderId.equals(order.getOrderId())) {
            if (!kitchenOrderRepository.findByOrderId(orderId).isEmpty()) {
                throw new DuplicateOrderIdException("A kitchen order already exists for orderId: " + orderId);
            }
        }
        order.setUserId(userId);
        order.setOrderId(orderId);
        try {
            return kitchenOrderRepository.save(order);
        } catch (DataAccessException e) {
            log.error("Failed to update kitchen order: {}", e.getMessage());
            throw new KitchenOrderNotSavedException("Failed to update kitchen order");
        }
    }

    public KitchenOrder updateKitchenOrderStatus(String id, String status) {
        KitchenOrder order = getKitchenOrder(id);
        if ("COMPLETED".equalsIgnoreCase(status)) {
            boolean allDone = order.getLines().stream()
                    .allMatch(line -> "DONE".equalsIgnoreCase(line.getStatus()));
            if (!allDone) {
                throw new LinesNotDoneException(
                        "Cannot set order to COMPLETED until every line has status DONE. Set all line statuses to DONE first.");
            }
        }
        order.setStatus(status);
        try {
            KitchenOrder saved = kitchenOrderRepository.save(order);
            if ("COMPLETED".equalsIgnoreCase(status)) {
                updateOrderPrepared(saved.getOrderId(), saved.getUserId());
                notifyOrderPrepared(saved.getUserId(), saved.getOrderId());
            }
            return saved;
        } catch (DataAccessException e) {
            log.error("Failed to update kitchen order status: {}", e.getMessage());
            throw new KitchenOrderNotSavedException("Failed to update kitchen order status");
        }
    }

    private void notifyOrderPrepared(String userId, String orderId) {
        try {
            SendNotificationRequest req = SendNotificationRequest.newBuilder()
                    .setUserId(userId)
                    .setChannel("IN_APP")
                    .setTemplateId("1")
                    .putTemplateData("title", "Order prepared")
                    .putTemplateData("message", "Your order #" + orderId + " is prepared and ready.")
                    .setSubject("Order prepared")
                    .setReferenceType("ORDER")
                    .setReferenceId(orderId != null ? orderId : "")
                    .build();
            notificationServiceStub.sendNotification(req);
            log.info("Notified user {} that order {} is prepared", userId, orderId);
        } catch (Exception e) {
            log.warn("Failed to send order-prepared notification: {}", e.getMessage());
        }
    }

    /** Update order in order service via gRPC: set status to PREPARED. */
    private void updateOrderPrepared(String orderId, String userId) {
        try {
            UpdateOrderRequest req = UpdateOrderRequest.newBuilder()
                    .setOrderId(orderId)
                    .setUserId(userId)
                    .setStatus("prepared")
                    .build();
            orderServiceStub.updateOrder(req);
            log.info("Updated order {} status to prepared", orderId);
        } catch (Exception e) {
            log.warn("Failed to update order {} to prepared: {}", orderId, e.getMessage());
        }
    }

    public KitchenOrder stopKitchenOrder(String id) {
        return updateKitchenOrderStatus(id, "STOPPED");
    }

    public KitchenOrder updateLineProgress(String orderId, String lineId, int progress) {
        KitchenOrder order = getKitchenOrder(orderId);
        KitchenOrderLine line = findLine(order, lineId);
        line.setProgress(Math.max(0, Math.min(100, progress)));
        try {
            return kitchenOrderRepository.save(order);
        } catch (DataAccessException e) {
            log.error("Failed to update line progress: {}", e.getMessage());
            throw new KitchenOrderNotSavedException("Failed to update line progress");
        }
    }

    public KitchenOrder updateLineStatus(String orderId, String lineId, String status) {
        KitchenOrder order = getKitchenOrder(orderId);
        KitchenOrderLine line = findLine(order, lineId);
        line.setStatus(status);
        try {
            return kitchenOrderRepository.save(order);
        } catch (DataAccessException e) {
            log.error("Failed to update line status: {}", e.getMessage());
            throw new KitchenOrderNotSavedException("Failed to update line status");
        }
    }

    public void deleteKitchenOrder(String id) {
        KitchenOrder order = getKitchenOrder(id);
        try {
            kitchenOrderRepository.delete(order);
        } catch (DataAccessException e) {
            log.error("Failed to delete kitchen order: {}", e.getMessage());
            throw new KitchenOrderNotSavedException("Failed to delete kitchen order");
        }
    }

    private KitchenOrderLine findLine(KitchenOrder order, String lineId) {
        return order.getLines().stream()
                .filter(l -> lineId.equals(l.getId()))
                .findFirst()
                .orElseThrow(() -> new KitchenOrderLineNotFoundException("Line not found: " + lineId));
    }
}
