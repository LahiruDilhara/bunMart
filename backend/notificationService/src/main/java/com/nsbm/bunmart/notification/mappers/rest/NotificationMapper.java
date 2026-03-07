package com.nsbm.bunmart.notification.mappers.rest;

import com.nsbm.bunmart.notification.dto.*;
import com.nsbm.bunmart.notification.model.Notification;
import com.nsbm.bunmart.notification.model.NotificationRule;
import com.nsbm.bunmart.notification.model.NotificationTemplate;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    // --- Notification ---

    public NotificationResponseDTO toNotificationResponseDTO(Notification notification) {
        NotificationResponseDTO dto = new NotificationResponseDTO();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUserId());
        dto.setChannel(notification.getChannel());
        dto.setTemplateId(notification.getTemplateId());
        dto.setTemplateData(notification.getTemplateData());
        dto.setSubject(notification.getSubject());
        dto.setBody(notification.getBody());
        dto.setReferenceType(notification.getReferenceType());
        dto.setReferenceId(notification.getReferenceId());
        dto.setStatus(notification.getStatus());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setUpdatedAt(notification.getUpdatedAt());
        return dto;
    }

    // --- Template ---

    public TemplateResponseDTO toTemplateResponseDTO(NotificationTemplate template) {
        TemplateResponseDTO dto = new TemplateResponseDTO();
        dto.setId(template.getId());
        dto.setName(template.getName());
        dto.setChannel(template.getChannel());
        dto.setSubject(template.getSubject());
        dto.setBody(template.getBody());
        dto.setCreatedAt(template.getCreatedAt());
        dto.setUpdatedAt(template.getUpdatedAt());
        return dto;
    }

    public NotificationTemplate toTemplateEntity(TemplateRequestDTO dto) {
        NotificationTemplate template = new NotificationTemplate();
        template.setName(dto.getName());
        template.setChannel(dto.getChannel());
        template.setSubject(dto.getSubject());
        template.setBody(dto.getBody());
        return template;
    }

    // --- Rule ---

    public RuleResponseDTO toRuleResponseDTO(NotificationRule rule) {
        RuleResponseDTO dto = new RuleResponseDTO();
        dto.setId(rule.getId());
        dto.setName(rule.getName());
        dto.setReferenceType(rule.getReferenceType());
        dto.setChannel(rule.getChannel());
        dto.setTemplateId(rule.getTemplateId());
        dto.setEnabled(rule.isEnabled());
        dto.setCreatedAt(rule.getCreatedAt());
        dto.setUpdatedAt(rule.getUpdatedAt());
        return dto;
    }

    public NotificationRule toRuleEntity(RuleRequestDTO dto) {
        NotificationRule rule = new NotificationRule();
        rule.setName(dto.getName());
        rule.setReferenceType(dto.getReferenceType());
        rule.setChannel(dto.getChannel());
        rule.setTemplateId(dto.getTemplateId());
        rule.setEnabled(dto.isEnabled());
        return rule;
    }
}
