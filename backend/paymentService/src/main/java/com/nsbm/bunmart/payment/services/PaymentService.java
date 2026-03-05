package com.nsbm.bunmart.payment.services;

import com.nsbm.bunmart.payment.model.Payment;
import java.util.Map;

// INTERFACE for business logic
// PaymentServiceImpl does the actual work
// grpcController and REST controller only talk to this interface
// benefit: if we change business logic only PaymentServiceImpl changes
// the controllers never need to change
public interface PaymentService {

    Payment createPaymentIntent(
            String orderId,
            String amount,
            String currencyCode,
            String userId,
            String orderName,
            Map<String, String> metadata
    );

    Payment getPaymentById(String paymentId);

    Payment getPaymentByOrderId(String orderId);

    // admin can manually confirm a payment if needed
    // normally stripe webhook handles this automatically
    Payment confirmPayment(String paymentId);

    // called by stripe webhook controller after stripe fires
    // success=true  means user paid successfully
    // success=false means card declined or expired
    Payment handleWebhookResult(String stripePaymentIntentId, boolean success);
}
