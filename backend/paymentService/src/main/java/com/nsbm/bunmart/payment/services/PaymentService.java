package com.nsbm.bunmart.payment.services;

import com.nsbm.bunmart.payment.model.Payment;
import java.util.Map;

// PaymentServiceImpl does the actual work
// Controllers talk to this interface
public interface PaymentService {

    Payment createPaymentIntent(
            String orderId,
            String amount,
            String currencyCode,
            String userId,
            Map<String, String> metadata
    );

    Payment getPaymentById(String paymentId);

    Payment getPaymentByOrderId(String orderId);

    Payment confirmPayment(String paymentId);
}
