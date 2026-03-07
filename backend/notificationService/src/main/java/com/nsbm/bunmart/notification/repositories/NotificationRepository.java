package com.nsbm.bunmart.notification.repositories;

import com.nsbm.bunmart.notification.model.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserId(String userId);

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    long countByUserIdAndReadFalse(String userId);

    List<Notification> findByReferenceTypeAndReferenceId(String referenceType, String referenceId);

    List<Notification> findByStatus(String status);
}
