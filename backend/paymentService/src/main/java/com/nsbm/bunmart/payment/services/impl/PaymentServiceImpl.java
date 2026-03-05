package com.nsbm.bunmart.payment.services.impl;

import com.nsbm.bunmart.payment.errors.*;
import com.nsbm.bunmart.payment.model.Payment;
import com.nsbm.bunmart.payment.repositories.PaymentRepository;
import com.nsbm.bunmart.payment.services.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

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

        paymentRepository.findByOrderId(orderId).ifPresent(existing -> {
            if (existing.getStatus() == Payment.PaymentStatus.SUCCESS)
                throw new PaymentAlreadyExistsException(orderId);
        });

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
}
