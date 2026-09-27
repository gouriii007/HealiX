package com.healix.hms.service;

import com.healix.hms.model.Notification;
import com.healix.hms.model.User;
import com.healix.hms.model.enums.NotificationType;

import java.util.List;

/**
 * NotificationService interface - uses Adapter pattern for delivery.
 * Demonstrates ABSTRACTION, INTERFACE, and Adapter design pattern.
 */
public interface NotificationService {
    void sendNotification(User user, String message, NotificationType type);
    void sendNotification(User user, String message, NotificationType type, Long hospitalId);
    List<Notification> getNotificationsForUser(User user);
    List<Notification> getUnreadNotifications(User user);
    long countUnread(User user);
    void markAllAsRead(User user);
    void markAsRead(Long notificationId);
}
