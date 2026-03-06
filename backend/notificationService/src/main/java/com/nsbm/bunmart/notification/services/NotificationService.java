package com.nsbm.bunmart.notification.services;

import com.nsbm.bunmart.notification.errors.NotificationNotFoundException;
import com.nsbm.bunmart.notification.errors.NotificationSendFailedException;
import com.nsbm.bunmart.notification.errors.RuleNotFoundException;
import com.nsbm.bunmart.notification.errors.TemplateNotFoundException;
import com.nsbm.bunmart.notification.model.Notification;
import com.nsbm.bunmart.notification.model.NotificationRule;
import com.nsbm.bunmart.notification.model.NotificationTemplate;
import com.nsbm.bunmart.notification.repositories.NotificationRepository;
import com.nsbm.bunmart.notification.repositories.RuleRepository;
import com.nsbm.bunmart.notification.repositories.TemplateRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final TemplateRepository templateRepository;
    private final RuleRepository ruleRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               TemplateRepository templateRepository,
                               RuleRepository ruleRepository) {
        this.notificationRepository = notificationRepository;
        this.templateRepository = templateRepository;
        this.ruleRepository = ruleRepository;
    }

    // ==================== Notification ====================

    public Notification sendNotification(String userId, String channel, Long templateId,
                                         Map<String, String> templateData, String subject,
                                         String referenceType, String referenceId) {

        NotificationTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new TemplateNotFoundException("Template not found: " + templateId));

        String renderedBody = renderTemplate(template.getBody(), templateData);
        String renderedSubject = (subject != null && !subject.isBlank())
                ? subject
                : renderTemplate(template.getSubject(), templateData);

        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setChannel(channel);
        notification.setTemplateId(String.valueOf(templateId));
        notification.setTemplateData(templateData);
        notification.setSubject(renderedSubject);
        notification.setBody(renderedBody);
        notification.setReferenceType(referenceType);
        notification.setReferenceId(referenceId);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setUpdatedAt(LocalDateTime.now());

        try {
            notification.setStatus("SENT");
            log.info("Notification sent to user={} channel={} ref={}:{}", userId, channel, referenceType, referenceId);
        } catch (Exception e) {
            notification.setStatus("FAILED");
            log.error("Failed to send notification to user={}: {}", userId, e.getMessage());
        }

        return notificationRepository.save(notification);
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public Notification getNotificationById(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found: " + id));
    }

    public List<Notification> getNotificationsByUserId(String userId) {
        return notificationRepository.findByUserId(userId);
    }

    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new NotificationNotFoundException("Notification not found: " + id);
        }
        notificationRepository.deleteById(id);
    }

    // ==================== Template ====================

    public NotificationTemplate createTemplate(NotificationTemplate template) {
        template.setCreatedAt(LocalDateTime.now());
        template.setUpdatedAt(LocalDateTime.now());
        return templateRepository.save(template);
    }

    public List<NotificationTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }

    public NotificationTemplate getTemplateById(Long id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new TemplateNotFoundException("Template not found: " + id));
    }

    public NotificationTemplate updateTemplate(Long id, NotificationTemplate updated) {
        NotificationTemplate existing = getTemplateById(id);
        existing.setName(updated.getName());
        existing.setChannel(updated.getChannel());
        existing.setSubject(updated.getSubject());
        existing.setBody(updated.getBody());
        existing.setUpdatedAt(LocalDateTime.now());
        return templateRepository.save(existing);
    }

    public void deleteTemplate(Long id) {
        if (!templateRepository.existsById(id)) {
            throw new TemplateNotFoundException("Template not found: " + id);
        }
        templateRepository.deleteById(id);
    }

    // ==================== Rule ====================

    public NotificationRule createRule(NotificationRule rule) {
        rule.setCreatedAt(LocalDateTime.now());
        rule.setUpdatedAt(LocalDateTime.now());
        return ruleRepository.save(rule);
    }

    public List<NotificationRule> getAllRules() {
        return ruleRepository.findAll();
    }

    public NotificationRule getRuleById(Long id) {
        return ruleRepository.findById(id)
                .orElseThrow(() -> new RuleNotFoundException("Rule not found: " + id));
    }

    public NotificationRule updateRule(Long id, NotificationRule updated) {
        NotificationRule existing = getRuleById(id);
        existing.setName(updated.getName());
        existing.setReferenceType(updated.getReferenceType());
        existing.setChannel(updated.getChannel());
        existing.setTemplateId(updated.getTemplateId());
        existing.setEnabled(updated.isEnabled());
        existing.setUpdatedAt(LocalDateTime.now());
        return ruleRepository.save(existing);
    }

    public void deleteRule(Long id) {
        if (!ruleRepository.existsById(id)) {
            throw new RuleNotFoundException("Rule not found: " + id);
        }
        ruleRepository.deleteById(id);
    }

    // ==================== Helper ====================

    private String renderTemplate(String template, Map<String, String> data) {
        if (template == null || data == null) return template;
        String result = template;
        for (Map.Entry<String, String> entry : data.entrySet()) {
            result = result.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        return result;
    }
}
