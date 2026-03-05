package com.nsbm.bunmart.kitchen.services;

import com.nsbm.bunmart.kitchen.errors.ImageNotFoundException;
//import com.nsbm.bunmart.kitchen.errors.OrderServiceUnavailableException;
import com.nsbm.bunmart.kitchen.errors.ProductionOrderNotFoundException;
import com.nsbm.bunmart.kitchen.errors.ProductionOrderNotSavedException;
import com.nsbm.bunmart.kitchen.model.PreparationImage;
import com.nsbm.bunmart.kitchen.model.ProductionLine;
import com.nsbm.bunmart.kitchen.model.ProductionOrder;
import com.nsbm.bunmart.kitchen.repositories.ProductionOrderRepository;
//import com.nsbm.bunmart.kitchen.v1.NotifyOrderPreparedRequest;
import com.nsbm.bunmart.order.v1.OrderServiceGrpc;
//import io.grpc.StatusRuntimeException;
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

    private final ProductionOrderRepository productionOrderRepository;

    @GrpcClient("orderService")
    private OrderServiceGrpc.OrderServiceBlockingStub orderStub;

    public KitchenService(ProductionOrderRepository productionOrderRepository) {
        this.productionOrderRepository = productionOrderRepository;
    }

    //  CREATE

    public ProductionOrder createProductionOrder(String userOrderId, List<ProductionLine> lines) {
        ProductionOrder order = new ProductionOrder();
        order.setUserOrderId(userOrderId);
        order.setPhase("PREPARING");
        order.setProgressPercent(0);

        for (ProductionLine line : lines) {
            line.setProductionOrder(order);
        }
        order.setLines(lines);

        try {
            return productionOrderRepository.save(order);
        } catch (DataAccessException e) {
            log.error("Failed to save production order: {}", e.getMessage());
            throw new ProductionOrderNotSavedException("Failed to create production order");
        }
    }

    //  READ

    public ProductionOrder getProductionOrder(String id) {
        return productionOrderRepository.findById(id)
                .orElseThrow(() -> new ProductionOrderNotFoundException("Production order not found: " + id));
    }

    public List<ProductionOrder> getAllProductionOrders() {
        return productionOrderRepository.findAll();
    }

    // UPDATE PHASE

    public ProductionOrder updatePhase(String id, String phase, int progressPercent) {
        ProductionOrder order = getProductionOrder(id);
        order.setPhase(phase);
        order.setProgressPercent(progressPercent);

        try {
            ProductionOrder saved = productionOrderRepository.save(order);

            // If completed, notify Order Service via gRPC
            if ("COMPLETED".equalsIgnoreCase(phase)) {
                //notifyOrderPrepared(saved.getId(), saved.getUserOrderId());
            }

            return saved;
        } catch (DataAccessException e) {
            log.error("Failed to update phase: {}", e.getMessage());
            throw new ProductionOrderNotSavedException("Failed to update production order phase");
        }
    }

    //  UPDATE NOTES

    public ProductionOrder updateNotes(String id, String notes) {
        ProductionOrder order = getProductionOrder(id);
        order.setNotes(notes);

        try {
            return productionOrderRepository.save(order);
        } catch (DataAccessException e) {
            log.error("Failed to update notes: {}", e.getMessage());
            throw new ProductionOrderNotSavedException("Failed to update notes");
        }
    }

    // IMAGES

    public ProductionOrder addImage(String id, String imageUrl) {
        ProductionOrder order = getProductionOrder(id);

        PreparationImage image = new PreparationImage();
        image.setImageUrl(imageUrl);
        image.setProductionOrder(order);
        order.getImages().add(image);

        try {
            return productionOrderRepository.save(order);
        } catch (DataAccessException e) {
            log.error("Failed to add image: {}", e.getMessage());
            throw new ProductionOrderNotSavedException("Failed to add image");
        }
    }

    public void deleteImage(String orderId, String imageId) {
        ProductionOrder order = getProductionOrder(orderId);
        boolean removed = order.getImages().removeIf(img -> img.getId().equals(imageId));
        if (!removed) {
            throw new ImageNotFoundException("Image not found: " + imageId);
        }

        try {
            productionOrderRepository.save(order);
        } catch (DataAccessException e) {
            log.error("Failed to delete image: {}", e.getMessage());
            throw new ProductionOrderNotSavedException("Failed to delete image");
        }
    }

    // DELETE

    public void deleteProductionOrder(String id) {
        ProductionOrder order = getProductionOrder(id);
        try {
            productionOrderRepository.delete(order);
        } catch (DataAccessException e) {
            log.error("Failed to delete production order: {}", e.getMessage());
            throw new ProductionOrderNotSavedException("Failed to delete production order");
        }
    }

    //  gRPC CLIENT: Notify Order Service
}
