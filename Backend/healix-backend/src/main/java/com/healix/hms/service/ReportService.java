package com.healix.hms.service;

import java.time.LocalDate;
import java.util.Map;

/**
 * ReportService interface - for admin reporting functionality.
 * JDBC component will be in the implementation.
 */
public interface ReportService {
    Map<String, Object> getAdminDashboardStats();
    Map<String, Object> getDailyReport(LocalDate date);
    Map<String, Object> getDoctorWiseReport();
    Map<String, Object> getDepartmentStats();
    Map<String, Long> getAppointmentStatusStats();
}
