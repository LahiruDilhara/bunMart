//package com.nsbm.bunmart.shipping.grpc;
//
//import com.nsbm.bunmart.shipping.dto.ShippingIntentDTO;
//import com.nsbm.bunmart.shipping.services.ShippingIntentService;
//import com.nsbm.bunmart.shipping.proto.;
//import com.nsbm.bunmart.shipping.v1.CreateShipmentResponse;
//import com.nsbm.bunmart.shipping.v1.ShippingServiceGrpc;
//import io.grpc.stub.StreamObserver;
//import org.springframework.beans.factory.annotation.Autowired;
//
//public class ShippingGrpcService extends ShippingServiceGrpc.ShippingServiceImplBase {
//
//    @Autowired
//    private final ShippingIntentService shippingIntentService;
//
//
//    public ShippingGrpcService(ShippingIntentService shippingIntentService) {
//        this.shippingIntentService = shippingIntentService;
//    }
//
//    public void createShippingIntent(CreateShippingIntentRequest request,
//                                     StreamObserver<CreateShippingIntentResponse> responseObserver){
//
//        ShippingIntentDTO shippingIntentDTO = new ShippingIntentDTO();
//        shippingIntentDTO.setOrderId(Integer.valueOf(request.getOrderId()));
//        shippingIntentDTO.setUserId(Integer.valueOf(request.getUserId()));
//        shippingIntentDTO.setAddressId(Integer.valueOf(request.getShippingAddressId()));
//
//        ShippingIntentDTO created = shippingIntentService.createShippingIntent(shippingIntentDTO);
//
//        CreateShippingIntentResponse
//
//
//    }
//}
