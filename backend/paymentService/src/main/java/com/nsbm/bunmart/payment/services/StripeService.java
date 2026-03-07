package com.nsbm.bunmart.payment.services;

import com.nsbm.bunmart.payment.configuration.StripeProperties;
import com.nsbm.bunmart.payment.model.Payment;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.util.Map;

/**
 * Creates Stripe Checkout Sessions for pending payments and returns the redirect URL.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StripeService {

    /**
     * Stripe minimum charge amounts in the currency's major unit (e.g. 100 LKR, 0.50 USD).
     * Charges below this are rejected by Stripe (must be at least ~0.50 USD equivalent).
     */
    private static final Map<String, BigDecimal> MINIMUM_AMOUNT_BY_CURRENCY = Map.of(
            "lkr", new BigDecimal("100"),
            "usd", new BigDecimal("0.50"),
            "eur", new BigDecimal("0.50"),
            "gbp", new BigDecimal("0.30"),
            "inr", new BigDecimal("0.50"),
            "aud", new BigDecimal("0.50"),
            "cad", new BigDecimal("0.50"),
            "sgd", new BigDecimal("0.50"),
            "jpy", new BigDecimal("50")
    );

    private final StripeProperties stripeProperties;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeProperties.getApiKey();
    }

    /**
     * Creates a Stripe Checkout Session for the given pending payment and returns the session URL.
     * Amount is converted to the smallest currency unit (e.g. cents for USD).
     */
    public String createCheckoutSessionUrl(Payment payment) throws StripeException {
        if (payment.getStatus() != Payment.PaymentStatus.PENDING) {
            throw new IllegalArgumentException("Payment must be PENDING to create checkout session");
        }

        // Stripe amounts are in smallest unit (cents for USD)
        long amountCents = payment.getAmount().multiply(BigDecimal.valueOf(100)).longValue();
        if (amountCents <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }

        String currency = payment.getCurrencyCode() == null ? "usd" : payment.getCurrencyCode().toLowerCase();

        BigDecimal minimum = MINIMUM_AMOUNT_BY_CURRENCY.get(currency);
        if (minimum != null && payment.getAmount().compareTo(minimum) < 0) {
            throw new IllegalArgumentException(
                    "Amount is below the minimum required for " + currency.toUpperCase() + " (minimum: " + minimum + "). Please use a higher amount.");
        }

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(stripeProperties.getSuccessUrl() + "?session_id={CHECKOUT_SESSION_ID}&payment_id=" + payment.getPaymentId() + "&order_id=" + payment.getOrderId())
                .setCancelUrl(stripeProperties.getCancelUrl() + "?payment_id=" + payment.getPaymentId() + "&order_id=" + payment.getOrderId())
                .setPaymentIntentData(
                        SessionCreateParams.PaymentIntentData.builder()
                                .putMetadata("payment_id", payment.getPaymentId())
                                .putMetadata("order_id", payment.getOrderId())
                                .build())
                .putMetadata("payment_id", payment.getPaymentId())
                .putMetadata("order_id", payment.getOrderId())
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency(currency)
                                                .setUnitAmount(amountCents)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Order " + payment.getOrderId())
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .build();

        var session = com.stripe.model.checkout.Session.create(params);
        String url = session.getUrl();
        log.info("Stripe Checkout Session created for paymentId={} url={}", payment.getPaymentId(), url != null ? "present" : "null");
        return url;
    }
}
