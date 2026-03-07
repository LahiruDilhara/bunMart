package com.nsbm.bunmart.payment.services.impl;

import com.nsbm.bunmart.order.v1.GetOrderRequest;
import com.nsbm.bunmart.order.v1.OrderInfo;
import com.nsbm.bunmart.order.v1.OrderServiceGrpc;
import com.nsbm.bunmart.order.v1.UpdateOrderRequest;
import com.nsbm.bunmart.notification.v1.NotificationServiceGrpc;
import com.nsbm.bunmart.notification.v1.SendNotificationRequest;
import com.nsbm.bunmart.payment.errors.*;
import com.nsbm.bunmart.payment.model.Payment;
import com.nsbm.bunmart.payment.repositories.PaymentRepository;
import com.nsbm.bunmart.payment.services.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import io.grpc.StatusRuntimeException;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    @GrpcClient("orderService")
    private OrderServiceGrpc.OrderServiceBlockingStub orderServiceStub;

    @GrpcClient("notificationService")
    private NotificationServiceGrpc.NotificationServiceBlockingStub notificationServiceStub;

    private final PaymentRepository paymentRepository;

    @Override
    @Transactional
    public Payment createPaymentIntent(String orderId, String amountStr,
                                       String currencyCode, String userId,
                                       Map<String, String> metadata) {

        if (orderId == null || orderId.isBlank())
            throw new IllegalArgumentException("Order ID cannot be empty");
        if (amountStr == null || amountStr.isBlank())
            throw new IllegalArgumentException("Amount cannot be empty");
        if (userId == null || userId.isBlank())
            throw new IllegalArgumentException("User ID cannot be empty");
        if (currencyCode == null || currencyCode.isBlank())
            throw new IllegalArgumentException("Currency code cannot be empty");

        BigDecimal amount;
        try {
            amount = new BigDecimal(amountStr);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid amount format: " + amountStr);
        }

        if (amount.compareTo(BigDecimal.ZERO) <= 0)
            throw new IllegalArgumentException("Amount must be greater than zero");

        List<Payment> existingPayments = paymentRepository.findByOrderId(orderId);
        boolean alreadyPaid = existingPayments.stream()
                .anyMatch(p -> p.getStatus() == Payment.PaymentStatus.SUCCESS);
        if (alreadyPaid)
            throw new PaymentAlreadyExistsException(orderId);

        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setUserId(userId);
        payment.setAmount(amount);
        payment.setCurrencyCode(currencyCode.toUpperCase());
        payment.setStatus(Payment.PaymentStatus.PENDING);

        Payment saved = paymentRepository.save(payment);
        log.info("payment created -> orderId={} paymentId={}", orderId, saved.getPaymentId());
        return saved;
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
        return paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId)
                .orElseThrow(() -> new PaymentNotFoundException("orderId", orderId));
    }

    @Override
    @Transactional
    public Payment createPaymentForOrder(String orderId, String userId) {
        if (orderId == null || orderId.isBlank())
            throw new IllegalArgumentException("Order ID cannot be empty");
        if (userId == null || userId.isBlank())
            throw new IllegalArgumentException("User ID cannot be empty");

        GetOrderRequest request = GetOrderRequest.newBuilder()
                .setOrderId(orderId)
                .setUserId(userId)
                .build();
        OrderInfo orderInfo;
        try {
            var response = orderServiceStub.getOrder(request);
            orderInfo = response.getOrder();
        } catch (StatusRuntimeException e) {
            log.warn("Order service call failed for orderId={} userId={}: {}", orderId, userId, e.getStatus());
            throw new PaymentProcessingException(orderId, "Order not found or not accessible: " + e.getStatus().getCode());
        }
        String totalStr = orderInfo.getTotal();
        String currencyCode = orderInfo.getCurrencyCode();
        if (totalStr == null || totalStr.isBlank())
            throw new PaymentProcessingException(orderId, "Order total is missing");
        if (currencyCode == null || currencyCode.isBlank())
            currencyCode = "USD";

        return createPaymentIntent(orderId, totalStr.trim(), currencyCode.trim(), userId, Map.of());
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
        Payment saved = paymentRepository.save(payment);
        updateOrderPaymentSuccess(saved.getOrderId(), saved.getUserId(), saved.getPaymentId());
        notifyPaymentSuccess(saved.getUserId(), saved.getOrderId());
        return saved;
    }

    /** Update order in order service via gRPC: set payment_id and status to PAID. */
    private void updateOrderPaymentSuccess(String orderId, String userId, String paymentId) {
        try {
            UpdateOrderRequest req = UpdateOrderRequest.newBuilder()
                    .setOrderId(orderId)
                    .setUserId(userId)
                    .setPaymentId(paymentId != null ? paymentId : "")
                    .setStatus("paid")
                    .build();
            orderServiceStub.updateOrder(req);
            log.info("Updated order {} with paymentId={} and status=paid", orderId, paymentId);
        } catch (Exception e) {
            log.warn("Failed to update order {} with payment success: {}", orderId, e.getMessage());
        }
    }

    private void notifyPaymentSuccess(String userId, String orderId) {
        try {
            SendNotificationRequest req = SendNotificationRequest.newBuilder()
                    .setUserId(userId)
                    .setChannel("IN_APP")
                    .setTemplateId("1")
                    .putTemplateData("title", "Payment successful")
                    .putTemplateData("message", "Your payment for order #" + orderId + " was successful.")
                    .setSubject("Payment successful")
                    .setReferenceType("ORDER")
                    .setReferenceId(orderId != null ? orderId : "")
                    .build();
            notificationServiceStub.sendNotification(req);
            log.info("Notified user {} of payment success for order {}", userId, orderId);
        } catch (Exception e) {
            log.warn("Failed to send payment-success notification to user {}: {}", userId, e.getMessage());
        }
    }
}
