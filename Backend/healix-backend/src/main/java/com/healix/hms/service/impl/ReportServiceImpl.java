package com.healix.hms.service.impl;

import com.healix.hms.model.enums.AppointmentStatus;
import com.healix.hms.repository.*;
import com.healix.hms.service.ReportService;
import com.healix.hms.util.JdbcReportUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * ReportServiceImpl - combines JPA stats with JDBC-based custom reports.
 * Demonstrates JDBC usage for academic requirement.
 */
@Service
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final DepartmentRepository departmentRepository;
    private final JdbcReportUtil jdbcReportUtil;

    public ReportServiceImpl(PatientRepository patientRepository,
                              DoctorRepository doctorRepository,
                              AppointmentRepository appointmentRepository,
                              DepartmentRepository departmentRepository,
                              JdbcReportUtil jdbcReportUtil) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.departmentRepository = departmentRepository;
        this.jdbcReportUtil = jdbcReportUtil;
    }

    @Override
    public Map<String, Object> getAdminDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPatients", patientRepository.countByActiveTrue());
        stats.put("totalDoctors", doctorRepository.countByActiveTrue());
        stats.put("totalDepartments", departmentRepository.countByActiveTrue());
        stats.put("totalAppointments", appointmentRepository.count());
        stats.put("todayAppointments", appointmentRepository.countByAppointmentDate(LocalDate.now()));
        stats.put("pendingAppointments", appointmentRepository.countByStatus(AppointmentStatus.PENDING));
        stats.put("confirmedAppointments", appointmentRepository.countByStatus(AppointmentStatus.CONFIRMED));
        stats.put("completedAppointments", appointmentRepository.countByStatus(AppointmentStatus.COMPLETED));
        stats.put("cancelledAppointments", appointmentRepository.countByStatus(AppointmentStatus.CANCELLED));
        return stats;
    }

    @Override
    public Map<String, Object> getDailyReport(LocalDate date) {
        // Uses JDBC for custom report
        return jdbcReportUtil.getDailyReportData(date);
    }

    @Override
    public Map<String, Object> getDoctorWiseReport() {
        return jdbcReportUtil.getDoctorWiseAppointmentReport();
    }

    @Override
    public Map<String, Object> getDepartmentStats() {
        return jdbcReportUtil.getDepartmentStats();
    }

    @Override
    public Map<String, Long> getAppointmentStatusStats() {
        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("PENDING", appointmentRepository.countByStatus(AppointmentStatus.PENDING));
        stats.put("CONFIRMED", appointmentRepository.countByStatus(AppointmentStatus.CONFIRMED));
        stats.put("COMPLETED", appointmentRepository.countByStatus(AppointmentStatus.COMPLETED));
        stats.put("CANCELLED", appointmentRepository.countByStatus(AppointmentStatus.CANCELLED));
        stats.put("RESCHEDULED", appointmentRepository.countByStatus(AppointmentStatus.RESCHEDULED));
        return stats;
    }
}
