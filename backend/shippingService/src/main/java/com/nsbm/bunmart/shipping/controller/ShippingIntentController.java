package com.nsbm.bunmart.shipping.controller;

import com.nsbm.bunmart.shipping.dto.ShippingIntentDTO;
import com.nsbm.bunmart.shipping.services.ShippingIntentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/shipping-intents")
public class ShippingIntentController {

    private final ShippingIntentService shippingIntentService;

    public ShippingIntentController(ShippingIntentService shippingIntentService) {
        this.shippingIntentService = shippingIntentService;
    }

    // Create Shipping Intent
    @PostMapping("/create-intent")
    public ResponseEntity<ShippingIntentDTO> createShippingIntent(@RequestBody ShippingIntentDTO dto){
        ShippingIntentDTO shippingIntentCreate = shippingIntentService.createShippingIntent(dto);
        return ResponseEntity.ok(shippingIntentCreate);
    }
}
