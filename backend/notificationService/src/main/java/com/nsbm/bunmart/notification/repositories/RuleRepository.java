package com.nsbm.bunmart.notification.repositories;

import com.nsbm.bunmart.notification.model.NotificationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RuleRepository extends JpaRepository<NotificationRule, Long> {

    List<NotificationRule> findByReferenceType(String referenceType);

    List<NotificationRule> findByEnabled(boolean enabled);
}
