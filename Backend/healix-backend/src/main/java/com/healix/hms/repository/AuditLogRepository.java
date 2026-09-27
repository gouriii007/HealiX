package com.healix.hms.repository;

import com.healix.hms.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByHospitalIdOrderByTimestampDesc(Long hospitalId);
    List<AuditLog> findByUserIdOrderByTimestampDesc(Long userId);
    List<AuditLog> findTop50ByOrderByTimestampDesc();
}
