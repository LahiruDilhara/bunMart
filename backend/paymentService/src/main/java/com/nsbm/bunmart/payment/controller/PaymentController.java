package com.nsbm.bunmart.payment.controller;

import com.nsbm.bunmart.payment.dto.ArchivePaymentResponseDTO;
import com.nsbm.bunmart.payment.dto.CreatePaymentRequestDTO;
import com.nsbm.bunmart.payment.dto.PaymentResponseDTO;
import com.nsbm.bunmart.payment.dto.StripeCheckoutResponseDTO;
import com.nsbm.bunmart.payment.mappers.rest.PaymentMapper;
import com.nsbm.bunmart.payment.model.Payment;
import com.nsbm.bunmart.payment.services.PaymentService;
import com.nsbm.bunmart.payment.services.StripeService;
import com.stripe.exception.StripeException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final StripeService stripeService;
    private final PaymentMapper paymentMapper;

    @PostMapping
    public ResponseEntity<PaymentResponseDTO> createPayment(@Valid @RequestBody CreatePaymentRequestDTO request) {
        Payment payment = paymentService.createPaymentIntent(
                request.getOrderId(),
                request.getAmount().toPlainString(),
                request.getCurrencyCode(),
                request.getUserId(),
                request.getMetadata() != null ? request.getMetadata() : Map.of()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentMapper.paymentToPaymentResponseDTO(payment));
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentResponseDTO> getPayment(@PathVariable String paymentId) {
        Payment payment = paymentService.getPaymentById(paymentId);
        return ResponseEntity.ok(paymentMapper.paymentToPaymentResponseDTO(payment));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponseDTO> getPaymentByOrder(@PathVariable String orderId) {
        Payment payment = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(paymentMapper.paymentToPaymentResponseDTO(payment));
    }

    @GetMapping("/{paymentId}/checkout-url")
    public ResponseEntity<StripeCheckoutResponseDTO> getCheckoutUrl(@PathVariable String paymentId) throws StripeException {
        Payment payment = paymentService.getPaymentById(paymentId);
        String redirectUrl = stripeService.createCheckoutSessionUrl(payment);
        return ResponseEntity.ok(new StripeCheckoutResponseDTO(redirectUrl));
    }

    @PutMapping("/{paymentId}/status")
    public ResponseEntity<PaymentResponseDTO> confirmPayment(@PathVariable String paymentId) {
        Payment payment = paymentService.confirmPayment(paymentId);
        return ResponseEntity.ok(paymentMapper.paymentToPaymentResponseDTO(payment));
    }

    @DeleteMapping("/{paymentId}")
    public ResponseEntity<ArchivePaymentResponseDTO> archivePayment(@PathVariable String paymentId) {
        Payment payment = paymentService.getPaymentById(paymentId);
        return ResponseEntity.ok(paymentMapper.paymentToArchiveResponseDTO(payment));
    }
}
