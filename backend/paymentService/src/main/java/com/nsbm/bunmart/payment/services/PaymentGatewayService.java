package com.nsbm.bunmart.payment.services;

import java.math.BigDecimal;
import java.util.Map;

// this is an interface - think of it as a contract
// any payment gateway we use MUST implement this method
// right now we use Stripe, but if we switch to PayHere later
// we just create a new class that implements this - nothing else changes
// this pattern is called "strategy pattern" - good to mention in viva
public interface PaymentGatewayService {

    // every payment gateway must know how to create a payment intent
    // we pass in the order details and get back the gateway's response
    GatewayPaymentIntent createPaymentIntent(
            String orderId,
            BigDecimal amount,
            String currency,
            String orderName,
            Map<String, String> metadata
    ) throws Exception;

    // this record wraps whatever the gateway returns into one standard object
    // so our business logic does not care if it came from Stripe or PayHere
    // Stripe  -> gatewayIntentId = pi_xxx, clientSecret = pi_xxx_secret_xxx
    // PayHere -> gatewayIntentId = their order id, clientSecret = ""
    record GatewayPaymentIntent(
            String gatewayIntentId,  // we save this to match stripe webhook later
            String clientSecret,     // frontend needs this to show stripe payment form
            String status
    ) {}
}