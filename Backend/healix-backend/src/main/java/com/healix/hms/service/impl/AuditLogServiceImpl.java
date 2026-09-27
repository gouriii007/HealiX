package com.healix.hms.service.impl;

import com.healix.hms.model.AuditLog;
import com.healix.hms.repository.AuditLogRepository;
import com.healix.hms.service.AuditLogService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogServiceImpl(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public void logAction(Long userId, String userEmail, Long hospitalId, String action,
                          String resourceType, String resourceId, String ipAddress, String details) {
        AuditLog log = new AuditLog(userId, userEmail, hospitalId, action, resourceType, resourceId, details);
        log.setIpAddress(ipAddress);
        auditLogRepository.save(log);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getLogsForHospital(Long hospitalId) {
        return auditLogRepository.findByHospitalIdOrderByTimestampDesc(hospitalId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getRecentPlatformLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc();
    }
}
