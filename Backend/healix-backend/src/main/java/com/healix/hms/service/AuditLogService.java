package com.healix.hms.service;

import com.healix.hms.model.AuditLog;

import java.util.List;

public interface AuditLogService {
    void logAction(Long userId, String userEmail, Long hospitalId, String action,
                   String resourceType, String resourceId, String ipAddress, String details);
    List<AuditLog> getLogsForHospital(Long hospitalId);
    List<AuditLog> getRecentPlatformLogs();
}
