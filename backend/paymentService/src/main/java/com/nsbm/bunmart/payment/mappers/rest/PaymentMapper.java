package com.nsbm.bunmart.payment.mappers.rest;

import com.nsbm.bunmart.payment.dto.ArchivePaymentResponseDTO;
import com.nsbm.bunmart.payment.dto.PaymentResponseDTO;
import com.nsbm.bunmart.payment.model.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public PaymentResponseDTO paymentToPaymentResponseDTO(Payment payment) {
        if (payment == null) return null;
        PaymentResponseDTO dto = new PaymentResponseDTO();
        dto.setPaymentId(payment.getPaymentId());
        dto.setOrderId(payment.getOrderId());
        dto.setUserId(payment.getUserId());
        dto.setAmount(payment.getAmount());
        dto.setCurrencyCode(payment.getCurrencyCode());
        dto.setStatus(payment.getStatus() != null ? payment.getStatus().name() : null);
        dto.setCreatedAt(payment.getCreatedAt());
        dto.setUpdatedAt(payment.getUpdatedAt());
        return dto;
    }

    public ArchivePaymentResponseDTO paymentToArchiveResponseDTO(Payment payment) {
        if (payment == null) return null;
        return new ArchivePaymentResponseDTO("Payment archived successfully", payment.getPaymentId());
    }
}
