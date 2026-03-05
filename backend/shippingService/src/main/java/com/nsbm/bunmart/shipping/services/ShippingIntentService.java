//package com.nsbm.bunmart.shipping.services;
//
//import com.nsbm.bunmart.shipping.dto.ShippingIntentDTO;
//import com.nsbm.bunmart.shipping.model.ShippingIntent;
//import com.nsbm.bunmart.shipping.model.ShippingIntentStatus;
//import com.nsbm.bunmart.shipping.repositories.ShippingIntentRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
//@Service
//public class ShippingIntentService {
//
//    private final ShippingIntentRepository shippingIntentRepository;
//
//    public ShippingIntentService(ShippingIntentRepository shippingIntentRepository) {
//        this.shippingIntentRepository = shippingIntentRepository;
//    }
//
//    // 1️Create Shipping Intent
//    public ShippingIntentDTO createShippingIntent(ShippingIntentDTO shippingIntentDTO){
//
//        ShippingIntent intent = new ShippingIntent();
//        intent.setOrderId(shippingIntentDTO.getOrderId());
//        intent.setUserId(shippingIntentDTO.getUserId());
//        intent.setAddressId(shippingIntentDTO.getAddressId());
//        intent.setStatus(ShippingIntentStatus.PENDING); // Default status when created
//        intent.setCreated_at(LocalDateTime.now());
//
//        ShippingIntent savedIntent = shippingIntentRepository.save(intent);
//
//        // Entity → DTO
//        ShippingIntentDTO response = new ShippingIntentDTO(
//                savedIntent.getShipping_intent_id(),
//                savedIntent.getOrderId(),
//                savedIntent.getUserId(),
//                savedIntent.getAddressId(),
//                savedIntent.getStatus(),
//                savedIntent.getCreated_at()
//        );
//        // return mapToDTO(savedIntent); // if can use map to Entity → DTO
//        return response;
//
//    }
//
//    // Get Shipping Intent by ID
//    public ShippingIntentDTO getShippingIntentById(Integer intentId){
//
//        // Fetch driver from DB
//        ShippingIntent dto = shippingIntentRepository.findById(intentId).orElseThrow(() -> new RuntimeException("ShippingIntent Not Found"));
//
//        ShippingIntentDTO shippingIntentDTO = ShippingIntentDTO.builder()
//                .shipping_intent_id(dto.getShipping_intent_id())
//                .orderId(dto.getOrderId())
//                .userId(dto.getUserId())
//                .addressId(dto.getAddressId())
//                .status(dto.getStatus())
//                .created_at(dto.getCreated_at())
//                .build();
//
//        return shippingIntentDTO;
//    }
//
//    // Get all shipping intents
//    public List<ShippingIntentDTO> getAllShippingIntents() {
//        return shippingIntentRepository.findAll()
//                .stream()
//                .map(intent -> ShippingIntentDTO.builder()
//                        .shipping_intent_id(intent.getShipping_intent_id())
//                        .orderId(intent.getOrderId())
//                        .userId(intent.getUserId())
//                        .addressId(intent.getAddressId())
//                        .status(intent.getStatus())
//                        .created_at(intent.getCreated_at())
//                        .build())
//                .toList();
//    }
//
//    //  Get Shipping Intents by Status
//    public List<ShippingIntentDTO> getShippingIntentsByStatus(ShippingIntentStatus status){
//
//            List<ShippingIntentDTO> shippingIntents = shippingIntentRepository.findByStatus(status)
//                    .stream()
//                    .map(shippingIntent -> ShippingIntentDTO.builder()
//                            .shipping_intent_id(shippingIntent.getShipping_intent_id())
//                            .orderId(shippingIntent.getOrderId())
//                            .userId(shippingIntent.getUserId())
//                            .addressId(shippingIntent.getAddressId())
//                            .status(shippingIntent.getStatus())
//                            .created_at(shippingIntent.getCreated_at())
//                            .build())
//                    .toList();
//
//            return  shippingIntents;
//    }
//
//    //  Update Shipping Intent Status
//    public ShippingIntentDTO updateShippingIntentStatus(Integer intentId, ShippingIntentStatus status){
//
//        ShippingIntent shippingIntent = shippingIntentRepository.findById(intentId).orElseThrow(() -> new RuntimeException("ShippingIntent Not Found"));
//
//        shippingIntent.setStatus(status);
//
//        ShippingIntent updateshippingIntent = shippingIntentRepository.save(shippingIntent);
//
//        ShippingIntentDTO shippingIntentDTO1 = ShippingIntentDTO.builder()
//                .shipping_intent_id(updateshippingIntent.getShipping_intent_id())
//                .orderId(updateshippingIntent.getOrderId())
//                .userId(updateshippingIntent.getUserId())
//                .addressId(updateshippingIntent.getAddressId())
//                .status(updateshippingIntent.getStatus())
//                .created_at(updateshippingIntent.getCreated_at())
//                .build();
//
//        return shippingIntentDTO1;
//
//    }
//
//}













package com.nsbm.bunmart.shipping.services;

import com.nsbm.bunmart.shipping.dto.ShippingIntentDTO;
import com.nsbm.bunmart.shipping.model.ShippingIntent;
import com.nsbm.bunmart.shipping.model.ShippingIntentStatus;
import com.nsbm.bunmart.shipping.repositories.ShippingIntentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ShippingIntentService {

    private final ShippingIntentRepository shippingIntentRepository;
    private final OrderGrpcClient orderGrpcClient;
    private final UserGrpcClient userGrpcClient;

    public ShippingIntentService(
            ShippingIntentRepository shippingIntentRepository,
            OrderGrpcClient orderGrpcClient,
            UserGrpcClient userGrpcClient) {
        this.shippingIntentRepository = shippingIntentRepository;
        this.orderGrpcClient = orderGrpcClient;
        this.userGrpcClient = userGrpcClient;
    }

    // -------------------------
    // Create Shipping Intent (from DTO directly)
    // -------------------------
    public ShippingIntentDTO createShippingIntent(ShippingIntentDTO dto) {
        ShippingIntent intent = ShippingIntent.builder()
                .orderId(dto.getOrderId())
                .userId(dto.getUserId())
                .addressId(dto.getAddressId())
                .status(ShippingIntentStatus.PENDING)
                .created_at(LocalDateTime.now())
                .build();

        ShippingIntent saved = shippingIntentRepository.save(intent);
        return mapToDTO(saved);
    }

    // -------------------------
    // Create Shipping Intent from Order (mocked)
    // -------------------------
    public ShippingIntentDTO createShippingIntentFromOrder(String orderId) {
        // Call Order gRPC to get order info
        var orderInfo = orderGrpcClient.getOrder(orderId);

        // Call User gRPC to get user addresses
        var userInfo = userGrpcClient.getUser(orderInfo.getUserId());
        var addresses = userGrpcClient.getUserAddresses(orderInfo.getUserId());

        // Pick first shipping address (for demo)
        String addressId = addresses.isEmpty() ? "default-addr" : addresses.get(0).getAddressId();

        ShippingIntent intent = ShippingIntent.builder()
                .orderId(Integer.parseInt(orderInfo.getOrderId().replaceAll("[^0-9]", ""))) // convert mock string to int
                .userId(Integer.parseInt(userInfo.getUserId().replaceAll("[^0-9]", "")))
                .addressId(Integer.parseInt(addressId.replaceAll("[^0-9]", "")))
                .status(ShippingIntentStatus.PENDING)
                .created_at(LocalDateTime.now())
                .build();

        ShippingIntent saved = shippingIntentRepository.save(intent);
        log.info("Created ShippingIntent for orderId={} userId={}", intent.getOrderId(), intent.getUserId());
        return mapToDTO(saved);
    }

    // -------------------------
    // Get by ID
    // -------------------------
    public ShippingIntentDTO getShippingIntentById(Integer id) {
        ShippingIntent intent = shippingIntentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ShippingIntent not found: " + id));
        return mapToDTO(intent);
    }

    // -------------------------
    // Get All
    // -------------------------
    public List<ShippingIntentDTO> getAllShippingIntents() {
        return shippingIntentRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // -------------------------
    // Update Status
    // -------------------------
    public ShippingIntentDTO updateShippingIntentStatus(Integer id, ShippingIntentStatus status) {
        ShippingIntent intent = shippingIntentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ShippingIntent not found: " + id));
        intent.setStatus(status);
        ShippingIntent updated = shippingIntentRepository.save(intent);
        return mapToDTO(updated);
    }

    // -------------------------
    // Mapper
    // -------------------------
    private ShippingIntentDTO mapToDTO(ShippingIntent intent) {
        return ShippingIntentDTO.builder()
                .shipping_intent_id(intent.getShipping_intent_id())
                .orderId(intent.getOrderId())
                .userId(intent.getUserId())
                .addressId(intent.getAddressId())
                .status(intent.getStatus())
                .created_at(intent.getCreated_at())
                .build();
    }
}