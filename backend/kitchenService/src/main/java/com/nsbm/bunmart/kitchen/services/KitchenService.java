package com.nsbm.bunmart.kitchen.services;

import com.nsbm.bunmart.kitchen.dto.CreateKitchenOrderRequestDTO;
import com.nsbm.bunmart.kitchen.errors.DuplicateOrderIdException;
import com.nsbm.bunmart.kitchen.errors.KitchenOrderLineNotFoundException;
import com.nsbm.bunmart.kitchen.errors.KitchenOrderNotFoundException;
import com.nsbm.bunmart.kitchen.errors.KitchenOrderNotSavedException;
import com.nsbm.bunmart.kitchen.model.KitchenOrder;
import com.nsbm.bunmart.kitchen.model.KitchenOrderLine;
import com.nsbm.bunmart.kitchen.repositories.KitchenOrderRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@Transactional
public class KitchenService {

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
            return kitchenOrderRepository.save(order);
        } catch (DataAccessException e) {
            log.error("Failed to save kitchen order: {}", e.getMessage());
            throw new KitchenOrderNotSavedException("Failed to create kitchen order");
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
        order.setStatus(status);
        try {
            return kitchenOrderRepository.save(order);
        } catch (DataAccessException e) {
            log.error("Failed to update kitchen order status: {}", e.getMessage());
            throw new KitchenOrderNotSavedException("Failed to update kitchen order status");
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
