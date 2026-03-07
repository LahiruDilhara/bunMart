package com.nsbm.bunmart.payment.services;

import com.nsbm.bunmart.payment.dto.CreatePaymentRequestDTO;
import com.nsbm.bunmart.payment.model.Payment;
import java.util.Map;

// PaymentServiceImpl does the actual work
// Controllers talk to this interface
public interface PaymentService {

    /**
     * Creates a payment intent from DTO (e.g. from gRPC or REST).
     */
    default Payment createPaymentIntent(CreatePaymentRequestDTO dto) {
        return createPaymentIntent(
                dto.getOrderId(),
                dto.getAmount() != null ? dto.getAmount().toPlainString() : null,
                dto.getCurrencyCode(),
                dto.getUserId(),
                dto.getMetadata() != null ? dto.getMetadata() : Map.of()
        );
    }

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

    /**
     * Fetches order details from order service via gRPC (total, currency), then creates a payment for that order.
     */
    Payment createPaymentForOrder(String orderId, String userId);
}
