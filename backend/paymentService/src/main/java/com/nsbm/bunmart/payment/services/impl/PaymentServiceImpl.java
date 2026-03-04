package com.nsbm.bunmart.payment.services.impl;

import com.nsbm.bunmart.payment.errors.*;
import com.nsbm.bunmart.payment.grpcController.NotificationGrpcClient;
import com.nsbm.bunmart.payment.grpcController.OrderGrpcClient;
import com.nsbm.bunmart.payment.model.Payment;
import com.nsbm.bunmart.payment.repositories.PaymentRepository;
import com.nsbm.bunmart.payment.services.PaymentGatewayService;
import com.nsbm.bunmart.payment.services.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.Map;

// this class implements PaymentService interface
// it handles all the business logic for payments
// controllers never talk to stripe directly - everything goes through here
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;

    // spring injects StripePaymentService here because it has @Primary
    // if we add PayHerePaymentService with @Primary this automatically switches
    // PaymentServiceImpl never needs to change - that is the benefit of the interface
    private final PaymentGatewayService paymentGatewayService;

    private final OrderGrpcClient orderGrpcClient;
    private final NotificationGrpcClient notificationGrpcClient;

    @Override
    @Transactional
    public Payment createPaymentIntent(String orderId, String amountStr,
                                       String currencyCode, String userId, String orderName,
                                       Map<String, String> metadata) {

        // always validate inputs before doing anything with them
        if (orderId == null || orderId.isBlank())
            throw new IllegalArgumentException("Order ID cannot be empty");
        if (amountStr == null || amountStr.isBlank())
            throw new IllegalArgumentException("Amount cannot be empty");
        if (userId == null || userId.isBlank())
            throw new IllegalArgumentException("User ID cannot be empty");
        if (currencyCode == null || currencyCode.isBlank())
            throw new IllegalArgumentException("Currency code cannot be empty");

        // parse amount carefully - bad format should give a clear error
        BigDecimal amount;
        try {
            amount = new BigDecimal(amountStr);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid amount format: " + amountStr);
        }

        if (amount.compareTo(BigDecimal.ZERO) <= 0)
            throw new IllegalArgumentException("Amount must be greater than zero");

        // do not create another payment if order already paid successfully
        // this prevents double charging if someone calls this twice
        paymentRepository.findByOrderId(orderId).ifPresent(existing -> {
            if (existing.getStatus() == Payment.PaymentStatus.SUCCESS)
                throw new PaymentAlreadyExistsException(orderId);
            // if previous attempt FAILED we allow a new one - user can retry
        });

        try {
            PaymentGatewayService.GatewayPaymentIntent gatewayIntent =
                    paymentGatewayService.createPaymentIntent(
                            orderId, amount, currencyCode,
                            orderName != null ? orderName : "Order " + orderId,
                            metadata != null ? metadata : Map.of()
                    );

            Payment payment = new Payment();
            payment.setOrderId(orderId);
            payment.setUserId(userId);
            payment.setAmount(amount);
            payment.setCurrencyCode(currencyCode.toUpperCase());
            payment.setOrderName(orderName);
            payment.setStripePaymentIntentId(gatewayIntent.gatewayIntentId());
            payment.setClientSecret(gatewayIntent.clientSecret());
            payment.setStatus(Payment.PaymentStatus.PENDING);

            Payment saved = paymentRepository.save(payment);
            log.info("payment created -> orderId={} paymentId={}",
                    orderId, saved.getPaymentId());
            return saved;

        } catch (IllegalArgumentException | PaymentAlreadyExistsException e) {
            throw e;
        } catch (Exception e) {
            log.error("stripe call failed -> orderId={} error={}", orderId, e.getMessage());
            throw new PaymentProcessingException(orderId, e.getMessage());
        }
    }

    @Override
    public Payment getPaymentById(String paymentId) {
        if (paymentId == null || paymentId.isBlank())
            throw new IllegalArgumentException("Payment ID cannot be empty");
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException(paymentId));
    }

    @Override
    public Payment getPaymentByOrderId(String orderId) {
        if (orderId == null || orderId.isBlank())
            throw new IllegalArgumentException("Order ID cannot be empty");
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentNotFoundException("orderId", orderId));
    }

    @Override
    @Transactional
    public Payment confirmPayment(String paymentId) {
        Payment payment = getPaymentById(paymentId);
        if (payment.getStatus() == Payment.PaymentStatus.FAILED)
            throw new InvalidPaymentStateException(
                    payment.getStatus(), Payment.PaymentStatus.PENDING);
        if (payment.getStatus() == Payment.PaymentStatus.SUCCESS) {
            log.warn("payment {} already confirmed - skipping", paymentId);
            return payment;
        }
        payment.setStatus(Payment.PaymentStatus.SUCCESS);
        return paymentRepository.save(payment);
    }

    @Override
    @Transactional
    public Payment handleWebhookResult(String stripePaymentIntentId, boolean success) {

        if (stripePaymentIntentId == null || stripePaymentIntentId.isBlank())
            throw new IllegalArgumentException("Stripe intent ID cannot be empty");

        // find payment using stripe's id not ours
        // stripe only knows its own pi_xxx id
        Payment payment = paymentRepository
                .findByStripePaymentIntentId(stripePaymentIntentId)
                .orElseThrow(() -> new PaymentNotFoundException(
                        "stripePaymentIntentId", stripePaymentIntentId));

        // stripe sometimes fires the same webhook event more than once
        // we check here so we do not process the same payment twice
        if (payment.getStatus() == Payment.PaymentStatus.SUCCESS
                || payment.getStatus() == Payment.PaymentStatus.REFUNDED) {
            log.warn("payment {} already processed - ignoring duplicate webhook",
                    payment.getPaymentId());
            return payment;
        }

        payment.setStatus(success
                ? Payment.PaymentStatus.SUCCESS
                : Payment.PaymentStatus.FAILED);
        Payment saved = paymentRepository.save(payment);

        // tell order service the payment result via gRPC
        // wrapped in try-catch so if order service is down it does not crash us
        try {
            orderGrpcClient.notifyPaymentResult(
                    saved.getOrderId(), saved.getPaymentId(), success);
        } catch (Exception e) {
            log.error("could not notify order service -> orderId={}", saved.getOrderId());
        }

        // only send receipt email if payment actually succeeded
        if (success) {
            try {
                notificationGrpcClient.sendPaymentConfirmation(
                        saved.getUserId(), saved.getPaymentId(), saved.getOrderId());
            } catch (Exception e) {
                log.error("could not send receipt email -> userId={}", saved.getUserId());
            }
        }

        return saved;
    }
}