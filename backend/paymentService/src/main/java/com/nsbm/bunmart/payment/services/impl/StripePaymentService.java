package com.nsbm.bunmart.payment.services.impl;

import com.nsbm.bunmart.payment.services.PaymentGatewayService;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

// this is the Stripe implementation of PaymentGatewayService
// @Primary means spring will inject this when PaymentGatewayService is needed
// if we switch to PayHere later - remove @Primary here, add it to PayHerePaymentService
// nothing else in the codebase needs to change - that is the whole point of the interface
@Service
@Primary
public class StripePaymentService implements PaymentGatewayService {

    // reads stripe.api.key from application.properties when app starts
    // constructor injection is better than @Value on a field
    public StripePaymentService(@Value("${stripe.api.key}") String apiKey) {
        Stripe.apiKey = apiKey;
    }

    @Override
    public GatewayPaymentIntent createPaymentIntent(
            String orderId, BigDecimal amount, String currency,
            String orderName, Map<String, String> metadata) throws Exception {

        // stripe does not accept decimal amounts like 1000.00
        // it needs the smallest unit of the currency
        // so 1000 LKR needs to be sent as 100000
        long amountInSmallestUnit = amount
                .multiply(BigDecimal.valueOf(100))
                .longValue();

        // attach our order details to the stripe payment
        // useful for tracking payments in stripe dashboard
        Map<String, String> stripeMetadata = new HashMap<>(metadata);
        stripeMetadata.put("order_id", orderId);
        stripeMetadata.put("order_name", orderName);

        // build the request object stripe expects
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInSmallestUnit)
                .setCurrency(currency.toLowerCase())
                .setDescription(orderName)
                .putAllMetadata(stripeMetadata)
                .build();

        // actually calls stripe api over the internet
        // stripe creates the payment intent on their side and returns it
        PaymentIntent intent = PaymentIntent.create(params);

        // wrap stripe response into our standard record
        // caller does not need to know anything about stripe internals
        return new GatewayPaymentIntent(
                intent.getId(),            // pi_3Qxxx - we save this to match webhook later
                intent.getClientSecret(),  // frontend uses this to show stripe card form
                intent.getStatus()
        );
    }
}