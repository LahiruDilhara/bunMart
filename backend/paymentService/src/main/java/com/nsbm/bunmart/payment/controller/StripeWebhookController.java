package com.nsbm.bunmart.payment.controller;

import com.nsbm.bunmart.payment.configuration.StripeProperties;
import com.nsbm.bunmart.payment.dto.ErrorResponseDTO;
import com.nsbm.bunmart.payment.services.PaymentService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Handles Stripe webhooks (checkout.session.completed, payment_intent.succeeded) to confirm payments.
 */
@RestController
@RequestMapping("/api/v1/payments/stripe")
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookController {

    private final StripeProperties stripeProperties;
    private final PaymentService paymentService;

    @PostMapping(value = "/webhook", consumes = "application/json")
    public ResponseEntity<?> webhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        log.debug("Stripe webhook received, signature present={}", sigHeader != null && !sigHeader.isBlank());

        if (sigHeader == null || sigHeader.isBlank()) {
            log.warn("Stripe webhook received without Stripe-Signature header");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponseDTO("Missing Stripe-Signature"));
        }

        String webhookSecret = stripeProperties.getWebhookSecret();
        if (webhookSecret == null || webhookSecret.isBlank() || webhookSecret.startsWith("whsec_YOUR_")) {
            log.warn("Stripe webhook secret not configured");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseDTO("Webhook not configured"));
        }

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.warn("Stripe webhook signature verification failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponseDTO("Invalid signature"));
        }

        if ("checkout.session.completed".equals(event.getType())) {
            EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
            deserializer.getObject().ifPresent(this::handleCheckoutSessionCompleted);
        } else if ("payment_intent.succeeded".equals(event.getType())) {
            EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
            deserializer.getObject().ifPresent(this::handlePaymentIntentSucceeded);
        }

        return ResponseEntity.ok().build();
    }

    private void handleCheckoutSessionCompleted(StripeObject obj) {
        if (!(obj instanceof com.stripe.model.checkout.Session session)) {
            return;
        }
        String paymentId = session.getMetadata() != null ? session.getMetadata().get("payment_id") : null;
        if (paymentId == null || paymentId.isBlank()) {
            log.warn("checkout.session.completed with no payment_id in metadata");
            return;
        }
        try {
            paymentService.confirmPayment(paymentId);
            log.info("Payment confirmed via Stripe webhook: paymentId={}", paymentId);
        } catch (Exception e) {
            log.error("Failed to confirm payment {} from webhook: {}", paymentId, e.getMessage());
        }
    }

    private void handlePaymentIntentSucceeded(StripeObject obj) {
        if (!(obj instanceof com.stripe.model.PaymentIntent paymentIntent)) {
            return;
        }
        String paymentId = paymentIntent.getMetadata() != null ? paymentIntent.getMetadata().get("payment_id") : null;
        if (paymentId == null || paymentId.isBlank()) {
            log.warn("payment_intent.succeeded with no payment_id in metadata");
            return;
        }
        try {
            paymentService.confirmPayment(paymentId);
            log.info("Payment confirmed via Stripe webhook (payment_intent.succeeded): paymentId={}", paymentId);
        } catch (Exception e) {
            log.error("Failed to confirm payment {} from webhook: {}", paymentId, e.getMessage());
        }
    }
}
