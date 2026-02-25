package com.nsbm.bunmart.shipping.services;

import com.nsbm.bunmart.shipping.dto.ShippingIntentDTO;
import com.nsbm.bunmart.shipping.model.ShippingIntent;
import com.nsbm.bunmart.shipping.model.ShippingIntentStatus;
import com.nsbm.bunmart.shipping.repositories.ShippingIntentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ShippingIntentService {

    @Autowired
    private ShippingIntentRepository shippingIntentRepository;

    // 1️Create Shipping Intent
    public ShippingIntentDTO createShippingIntent(ShippingIntentDTO shippingIntentDTO){

        ShippingIntent intent = new ShippingIntent();
        intent.setOrderId(shippingIntentDTO.getOrderId());
        intent.setUserId(shippingIntentDTO.getUserId());
        intent.setAddressId(shippingIntentDTO.getAddressId());
        intent.setStatus(ShippingIntentStatus.PENDING); // Default status when created
        intent.setCreated_at(LocalDateTime.now());

        ShippingIntent savedIntent = shippingIntentRepository.save(intent);

        // Entity → DTO
        ShippingIntentDTO response = new ShippingIntentDTO(
                savedIntent.getShipping_intent_id(),
                savedIntent.getOrderId(),
                savedIntent.getUserId(),
                savedIntent.getAddressId(),
                savedIntent.getStatus(),
                savedIntent.getCreated_at()
        );
        // return mapToDTO(savedIntent); // if can use map to Entity → DTO
        return response;

    }


}
