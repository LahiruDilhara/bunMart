package com.nsbm.bunmart.notification.configuration;

import com.nsbm.bunmart.notification.model.NotificationTemplate;
import com.nsbm.bunmart.notification.repositories.TemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Ensures default template id=1 exists for order-event notifications (payment, kitchen, order, shipping).
 * Placeholders: {{title}}, {{message}}
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DefaultTemplateInitializer {

    public static final long ORDER_EVENT_TEMPLATE_ID = 1L;

    private final TemplateRepository templateRepository;

    @EventListener(ApplicationReadyEvent.class)
    public void init() {
        if (templateRepository.findById(ORDER_EVENT_TEMPLATE_ID).isPresent()) {
            return;
        }
        NotificationTemplate t = new NotificationTemplate();
        t.setName("Order Event");
        t.setChannel("IN_APP");
        t.setSubject("{{title}}");
        t.setBody("{{message}}");
        t.setCreatedAt(LocalDateTime.now());
        t.setUpdatedAt(LocalDateTime.now());
        try {
            templateRepository.save(t);
            log.info("Created default order-event notification template");
        } catch (Exception e) {
            log.warn("Could not create default template (may already exist): {}", e.getMessage());
        }
    }
}
