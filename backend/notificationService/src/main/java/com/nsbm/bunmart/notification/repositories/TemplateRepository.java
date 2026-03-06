package com.nsbm.bunmart.notification.repositories;

import com.nsbm.bunmart.notification.model.NotificationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TemplateRepository extends JpaRepository<NotificationTemplate, Long> {

    List<NotificationTemplate> findByChannel(String channel);
}
