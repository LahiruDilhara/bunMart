package com.nsbm.bunmart.payment.repositories;

import com.nsbm.bunmart.payment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

// JpaRepository handles all basic database operations for us
// no need to write any SQL manually - spring generates it at runtime
// <Payment, String> means Payment is the entity, String is the type of primary key
@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {

    // spring sees this method name and auto generates:
    // SELECT * FROM payments WHERE order_id = ?
    // we use this when order service asks "did this order get paid?"
    Optional<Payment> findByOrderId(String orderId);

    // stripe does not know our internal payment_id
    // stripe only knows its own id which looks like pi_3Qxxx...
    // so when the webhook fires we use this to find the right payment
    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);
}