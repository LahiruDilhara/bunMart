package com.nsbm.bunmart.kitchen.grpc;

import com.nsbm.bunmart.kitchen.services.KitchenService;

public class GrpcControllerImpl extends GrpcController {
    public GrpcControllerImpl(KitchenService kitchenService) {
        super(kitchenService);
    }
}
