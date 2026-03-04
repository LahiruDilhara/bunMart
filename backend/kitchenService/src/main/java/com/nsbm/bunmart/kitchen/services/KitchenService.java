package com.nsbm.bunmart.kitchen.services;

import com.nsbm.bunmart.kitchen.dto.KitchenOrderResponseDTO;
import com.nsbm.bunmart.kitchen.mappers.grpc.GRPCMapper;
import com.nsbm.bunmart.kitchen.model.KitchenOrder;
import com.nsbm.bunmart.kitchen.model.KitchenStatus;
import com.nsbm.bunmart.kitchen.repositories.KitchenRepository;
import com.nsbm.order.stubs.OrderRequest;
import com.nsbm.order.stubs.OrderResponse;
import com.nsbm.order.stubs.OrderServiceGrpc;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class KitchenService {

    private final KitchenRepository kitchenRepository;
    private final GRPCMapper grpcMapper;

    @GrpcClient("order-service")
    private OrderServiceGrpc.OrderServiceBlockingStub orderStub;

    @Transactional
    public KitchenOrderResponseDTO fetchAndInitializeOrder(String orderId) {
        // 1. Call Order Service via gRPC
        OrderRequest request = OrderRequest.newBuilder().setOrderId(orderId).build();
        OrderResponse response = orderStub.getOrderById(request);

        // 2. Map and Save
        KitchenOrder order = grpcMapper.mapOrderResponseToEntity(response);
        KitchenOrder savedOrder = kitchenRepository.save(order);

        return mapToDTO(savedOrder);
    }

    public List<KitchenOrderResponseDTO> getActiveOrders() {
        return kitchenRepository.findByStatusNot(KitchenStatus.PICKED_UP)
                .stream().map(this::mapToDTO).toList();
    }

    @Transactional
    public KitchenOrderResponseDTO updateStatus(String orderId, KitchenStatus status) {
        KitchenOrder order = kitchenRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        order.setStatus(status);
        return mapToDTO(kitchenRepository.save(order));
    }

    private KitchenOrderResponseDTO mapToDTO(KitchenOrder order) {
        // Simple manual mapping or use your CartMapper/RestMapper
        return new KitchenOrderResponseDTO(order.getId(), order.getStatus().name(), order.getCreatedAt());
    }
}