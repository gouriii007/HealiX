package com.healix.hms.service.impl;

import com.healix.hms.model.Notification;
import com.healix.hms.model.User;
import com.healix.hms.model.enums.NotificationType;
import com.healix.hms.pattern.adapter.NotificationAdapter;
import com.healix.hms.repository.NotificationRepository;
import com.healix.hms.service.NotificationService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * NotificationServiceImpl - uses Adapter pattern for delivery.
 * Demonstrates: Adapter pattern, DIP, SRP.
 */
@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    // Adapter pattern: depends on interface, not concrete implementation
    private final NotificationAdapter notificationAdapter;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                    @Qualifier("emailNotificationAdapter") NotificationAdapter notificationAdapter) {
        this.notificationRepository = notificationRepository;
        this.notificationAdapter = notificationAdapter;
    }

    @Override
    public void sendNotification(User user, String message, NotificationType type) {
        sendNotification(user, message, type, null);
    }

    @Override
    public void sendNotification(User user, String message, NotificationType type, Long hospitalId) {
        // Save to DB
        Notification notification = new Notification(user, message, type);
        notification.setHospitalId(hospitalId);
        notificationRepository.save(notification);

        // Deliver via adapter (email/SMS)
        notificationAdapter.sendNotification(
            user.getEmail(), user.getName(),
            "Healix - " + type.name().replace("_", " "),
            message
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getNotificationsForUser(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepository.findByUserAndReadFalseOrderByCreatedAtDesc(user);
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnread(User user) {
        return notificationRepository.countByUserAndReadFalse(user);
    }

    @Override
    public void markAllAsRead(User user) {
        notificationRepository.markAllAsReadByUser(user);
    }

    @Override
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }
}
