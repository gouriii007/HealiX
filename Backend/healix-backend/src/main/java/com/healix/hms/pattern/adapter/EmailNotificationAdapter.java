package com.healix.hms.pattern.adapter;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

/**
 * =====================================================================
 * EmailNotificationAdapter - ADAPTER DESIGN PATTERN (Concrete Adapter)
 * =====================================================================
 * Implements the NotificationAdapter interface for email delivery.
 * In production, this would integrate with an SMTP server or email API.
 * For this academic project, it logs the notification to console.
 *
 * Demonstrates:
 *   - Implements NotificationAdapter (interface)
 *   - Method Overriding: overrides sendNotification() and getAdapterName()
 *   - Adapter Pattern: adapts email sending to the common interface
 * =====================================================================
 */
@Component("emailNotificationAdapter")
@Primary
public class EmailNotificationAdapter implements NotificationAdapter {

    @Override
    public void sendNotification(String recipientEmail, String recipientName,
                                  String subject, String message) {
        // In production: integrate with JavaMailSender / SendGrid / etc.
        // For academic demonstration: log to console
        System.out.println("=== [EMAIL NOTIFICATION] ===");
        System.out.println("To: " + recipientName + " <" + recipientEmail + ">");
        System.out.println("Subject: " + subject);
        System.out.println("Message: " + message);
        System.out.println("============================");
    }

    @Override
    public String getAdapterName() {
        return "EmailNotificationAdapter";
    }
}
