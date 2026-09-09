package com.healix.hms.pattern.adapter;

import org.springframework.stereotype.Component;

/**
 * =====================================================================
 * SMSNotificationAdapter - ADAPTER DESIGN PATTERN (Concrete Adapter)
 * =====================================================================
 * Implements the NotificationAdapter interface for SMS delivery.
 * Demonstrates that we can swap notification channels without changing
 * the calling code (NotificationServiceImpl).
 * =====================================================================
 */
@Component("smsNotificationAdapter")
public class SMSNotificationAdapter implements NotificationAdapter {

    @Override
    public void sendNotification(String recipientEmail, String recipientName,
                                  String subject, String message) {
        // In production: integrate with Twilio / MSG91 / Fast2SMS etc.
        // For academic demonstration: log to console
        System.out.println("=== [SMS NOTIFICATION] ===");
        System.out.println("To: " + recipientName);
        System.out.println("SMS: " + message);
        System.out.println("==========================");
    }

    @Override
    public String getAdapterName() {
        return "SMSNotificationAdapter";
    }
}
