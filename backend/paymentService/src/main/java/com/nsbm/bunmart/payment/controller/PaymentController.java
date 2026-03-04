package com.nsbm.bunmart.payment.controller;

import com.nsbm.bunmart.payment.model.Payment;
import com.nsbm.bunmart.payment.services.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

// REST controller - only FRONTEND calls these endpoints
// order service never calls these - it uses gRPC instead
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // GET /api/payments/{paymentId}
    // frontend calls this after being redirected to payment page
    // response includes client_secret for stripe.js payment form
    @GetMapping("/{paymentId}")
    public ResponseEntity<Map<String, Object>> getPayment(@PathVariable String paymentId) {
        Payment payment = paymentService.getPaymentById(paymentId);
        return ResponseEntity.ok(Map.of(
                "paymentId",    payment.getPaymentId(),
                "orderId",      payment.getOrderId(),
                "amount",       payment.getAmount(),
                "currency",     payment.getCurrencyCode(),
                "status",       payment.getStatus().name(),
                "clientSecret", payment.getClientSecret()
        ));
    }

    // GET /api/payments/order/{orderId}
    // frontend checks payment status for a specific order
    @GetMapping("/order/{orderId}")
    public ResponseEntity<Map<String, Object>> getPaymentByOrder(@PathVariable String orderId) {
        Payment payment = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(Map.of(
                "paymentId", payment.getPaymentId(),
                "orderId",   payment.getOrderId(),
                "status",    payment.getStatus().name()
        ));
    }

    // PUT /api/payments/{paymentId}/status
    // admin manually confirms payment if needed
    // normally stripe webhook handles this automatically
    @PutMapping("/{paymentId}/status")
    public ResponseEntity<Map<String, Object>> confirmPayment(@PathVariable String paymentId) {
        Payment payment = paymentService.confirmPayment(paymentId);
        return ResponseEntity.ok(Map.of(
                "paymentId", payment.getPaymentId(),
                "status",    payment.getStatus().name()
        ));
    }

    // DELETE /api/payments/{paymentId}
    // archive old payment records - admin use only
    @DeleteMapping("/{paymentId}")
    public ResponseEntity<Map<String, Object>> archivePayment(@PathVariable String paymentId) {
        Payment payment = paymentService.getPaymentById(paymentId);
        return ResponseEntity.ok(Map.of(
                "message",   "Payment archived successfully",
                "paymentId", payment.getPaymentId()
        ));
    }

}
