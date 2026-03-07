package com.nsbm.bunmart.payment.mappers.grpc;

import com.nsbm.bunmart.payment.dto.CreatePaymentRequestDTO;
import com.nsbm.bunmart.payment.model.Payment;
import com.nsbm.bunmart.payment.v1.*;
import com.google.protobuf.Timestamp;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;

/**
 * Maps between payment domain models/DTOs and payment proto messages.
 */
@Component
public class GRPCMapper {

    public CreatePaymentRequestDTO toCreatePaymentRequestDTO(CreatePaymentIntentRequest request) {
        CreatePaymentRequestDTO dto = new CreatePaymentRequestDTO();
        dto.setOrderId(request.getOrderId());
        dto.setUserId(request.getUserId());
        dto.setAmount(new BigDecimal(request.getAmount()));
        dto.setCurrencyCode(request.getCurrencyCode());
        dto.setMetadata(new HashMap<>(request.getMetadataMap()));
        return dto;
    }

    public CreatePaymentIntentResponse toCreatePaymentIntentResponse(Payment payment) {
        return CreatePaymentIntentResponse.newBuilder()
                .setPaymentId(payment.getPaymentId())
                .setClientSecret(payment.getPaymentId()) // placeholder; model has no client_secret
                .setStatus(payment.getStatus() != null ? payment.getStatus().name() : "PENDING")
                .build();
    }

    public GetPaymentIntentResponse toGetPaymentIntentResponse(Payment payment) {
        return GetPaymentIntentResponse.newBuilder()
                .setPaymentId(payment.getPaymentId())
                .setClientSecret(payment.getPaymentId())
                .setStatus(payment.getStatus() != null ? payment.getStatus().name() : "PENDING")
                .build();
    }

    public GetPaymentStatusResponse toGetPaymentStatusResponse(Payment payment) {
        GetPaymentStatusResponse.Builder builder = GetPaymentStatusResponse.newBuilder()
                .setPaymentId(payment.getPaymentId())
                .setOrderId(payment.getOrderId())
                .setUserId(payment.getUserId())
                .setAmount(payment.getAmount() != null ? payment.getAmount().toPlainString() : "0")
                .setCurrencyCode(payment.getCurrencyCode() != null ? payment.getCurrencyCode() : "")
                .setStatus(payment.getStatus() != null ? payment.getStatus().name() : "PENDING");
        if (payment.getCreatedAt() != null) builder.setCreatedAt(toTimestamp(payment.getCreatedAt()));
        if (payment.getUpdatedAt() != null) builder.setUpdatedAt(toTimestamp(payment.getUpdatedAt()));
        return builder.build();
    }

    public ConfirmPaymentResponse toConfirmPaymentResponse(Payment payment) {
        boolean success = payment.getStatus() == Payment.PaymentStatus.SUCCESS;
        return ConfirmPaymentResponse.newBuilder()
                .setSuccess(success)
                .setStatus(payment.getStatus() != null ? payment.getStatus().name() : "PENDING")
                .build();
    }

    private static Timestamp toTimestamp(LocalDateTime dateTime) {
        return Timestamp.newBuilder()
                .setSeconds(dateTime.toInstant(ZoneOffset.UTC).getEpochSecond())
                .setNanos(dateTime.getNano())
                .build();
    }
}
