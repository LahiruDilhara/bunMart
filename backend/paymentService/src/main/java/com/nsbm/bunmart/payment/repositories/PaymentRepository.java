package com.nsbm.bunmart.payment.repositories;

import com.nsbm.bunmart.payment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {

    /** All payments for an order (may be multiple e.g. retries). */
    List<Payment> findByOrderId(String orderId);

    /** Latest payment for an order by creation time; use when a single result is required. */
    Optional<Payment> findFirstByOrderIdOrderByCreatedAtDesc(String orderId);
}