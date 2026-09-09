package com.healix.hms.pattern.adapter;

/**
 * =====================================================================
 * NotificationAdapter interface - ADAPTER DESIGN PATTERN (Target Interface)
 * =====================================================================
 * OOP / Design Pattern Concepts:
 *   - Adapter Pattern: allows incompatible interfaces to work together
 *   - Interface: defines the target contract
 *   - Abstraction: callers use this interface, not concrete implementations
 *   - Open/Closed Principle: new notification types can be added without
 *     modifying existing code
 *
 * Use Case: Notification delivery mechanism (email, SMS) can be swapped
 * without changing the core NotificationService code.
 * =====================================================================
 */
public interface NotificationAdapter {

    /**
     * Send a notification message to the given recipient.
     * @param recipientEmail the recipient's email address
     * @param recipientName  the recipient's display name
     * @param subject        the notification subject
     * @param message        the notification message body
     */
    void sendNotification(String recipientEmail, String recipientName,
                          String subject, String message);

    /**
     * Get the name of this adapter for logging/debugging.
     */
    String getAdapterName();
}
