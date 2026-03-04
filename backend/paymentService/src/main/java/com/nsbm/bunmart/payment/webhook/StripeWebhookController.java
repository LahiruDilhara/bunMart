package com.nsbm.bunmart.payment.webhook;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.nsbm.bunmart.payment.services.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// stripe calls this url automatically when payment succeeds or fails
// you do NOT call this manually - stripe does
// CRITICAL RULE: always return 200 OK even if processing fails
// if you return non-200 stripe retries the same webhook for up to 3 days
@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookController {

    private final PaymentService paymentService;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {

        // check signature header exists
        // if missing someone is calling manually, not stripe
        if (sigHeader == null || sigHeader.isBlank()) {
            log.warn("webhook received without stripe signature - rejecting");
            return ResponseEntity.badRequest().body("Missing Stripe-Signature header");
        }

        if (payload == null || payload.isBlank()) {
            log.warn("webhook received with empty body - rejecting");
            return ResponseEntity.badRequest().body("Empty payload");
        }

        Event event;
        try {
            // verify signature confirms this really came from stripe
            // if someone fakes a webhook this throws an exception
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.warn("invalid stripe signature - rejecting");
            return ResponseEntity.badRequest().body("Invalid signature");
        } catch (Exception e) {
            log.error("could not parse webhook -> {}", e.getMessage());
            return ResponseEntity.badRequest().body("Invalid payload format");
        }

        log.info("stripe webhook -> type={} id={}", event.getType(), event.getId());

        try {
            switch (event.getType()) {

                case "payment_intent.succeeded" -> {
                    PaymentIntent intent = extractPaymentIntent(event);
                    if (intent == null) return ResponseEntity.ok("Processed with warnings");
                    log.info("payment succeeded -> intentId={}", intent.getId());
                    paymentService.handleWebhookResult(intent.getId(), true);
                }

                case "payment_intent.payment_failed" -> {
                    PaymentIntent intent = extractPaymentIntent(event);
                    if (intent == null) return ResponseEntity.ok("Processed with warnings");
                    log.info("payment failed -> intentId={}", intent.getId());
                    paymentService.handleWebhookResult(intent.getId(), false);
                }

                // user took too long - payment window expired
                case "payment_intent.canceled" -> {
                    PaymentIntent intent = extractPaymentIntent(event);
                    if (intent != null) paymentService.handleWebhookResult(intent.getId(), false);
                }

                default -> log.info("ignoring stripe event -> {}", event.getType());
            }
        } catch (Exception e) {
            // log error but STILL return 200
            // if we return 500 stripe will retry endlessly
            log.error("error processing webhook {} -> {}", event.getType(), e.getMessage());
        }

        return ResponseEntity.ok("Received");
    }

    private PaymentIntent extractPaymentIntent(Event event) {
        try {
            return (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
        } catch (Exception e) {
            log.error("failed to deserialize payment intent -> {}", e.getMessage());
            return null;
        }
    }
}
