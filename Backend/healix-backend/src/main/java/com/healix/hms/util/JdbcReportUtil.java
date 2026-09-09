package com.healix.hms.util;

import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.*;
import java.time.LocalDate;
import java.util.*;

/**
 * =====================================================================
 * JdbcReportUtil - JDBC Demonstration Component
 * =====================================================================
 * OOP / JDBC Concepts Demonstrated:
 *   - Connection: establishes database connection via DataSource
 *   - PreparedStatement: safe parameterized SQL queries
 *   - ResultSet: iterating over query results
 *   - CRUD: reads data for custom reports
 *   - try-with-resources: proper resource management (finally equivalent)
 *
 * This class is intentionally SEPARATE from the JPA layer to
 * demonstrate raw JDBC as required by the KTU S3 syllabus.
 *
 * Note: This uses the same DataSource configured in application.properties.
 * =====================================================================
 */
@Component
public class JdbcReportUtil {

    // DataSource provides JDBC connections - configured in application.properties
    private final DataSource dataSource;

    public JdbcReportUtil(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Get daily appointment report using raw JDBC.
     * Demonstrates: Connection, PreparedStatement, ResultSet
     */
    public Map<String, Object> getDailyReportData(LocalDate date) {
        Map<String, Object> report = new LinkedHashMap<>();
        List<Map<String, Object>> appointments = new ArrayList<>();

        // JDBC: establish connection
        String sql = """
            SELECT a.id, u_p.name AS patient_name, u_d.name AS doctor_name,
                   d.name AS department_name, a.appointment_time, a.status, a.reason
            FROM appointments a
            JOIN patients p ON a.patient_id = p.user_id
            JOIN users u_p ON p.user_id = u_p.id
            JOIN doctors doc ON a.doctor_id = doc.user_id
            JOIN users u_d ON doc.user_id = u_d.id
            LEFT JOIN departments d ON doc.department_id = d.id
            WHERE a.appointment_date = ?
            ORDER BY a.appointment_time ASC
            """;

        // try-with-resources ensures connection is closed (demonstrates finally equivalent)
        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql)) {

            // JDBC: set PreparedStatement parameter
            preparedStatement.setDate(1, java.sql.Date.valueOf(date));

            // JDBC: execute and iterate ResultSet
            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                while (resultSet.next()) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", resultSet.getLong("id"));
                    row.put("patientName", resultSet.getString("patient_name"));
                    row.put("doctorName", resultSet.getString("doctor_name"));
                    row.put("department", resultSet.getString("department_name"));
                    row.put("time", resultSet.getString("appointment_time"));
                    row.put("status", resultSet.getString("status"));
                    row.put("reason", resultSet.getString("reason"));
                    appointments.add(row);
                }
            }

        } catch (SQLException e) {
            // Proper exception handling - log but don't expose to user
            System.err.println("JDBC Error in getDailyReportData: " + e.getMessage());
        }

        report.put("date", date.toString());
        report.put("appointments", appointments);
        report.put("totalCount", appointments.size());
        return report;
    }

    /**
     * Get doctor-wise appointment summary using raw JDBC.
     */
    public Map<String, Object> getDoctorWiseAppointmentReport() {
        Map<String, Object> report = new LinkedHashMap<>();
        List<Map<String, Object>> doctorStats = new ArrayList<>();

        String sql = """
            SELECT u.name AS doctor_name, doc.specialization,
                   COUNT(a.id) AS total,
                   SUM(CASE WHEN a.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed,
                   SUM(CASE WHEN a.status = 'PENDING' THEN 1 ELSE 0 END) AS pending,
                   SUM(CASE WHEN a.status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled
            FROM doctors doc
            JOIN users u ON doc.user_id = u.id
            LEFT JOIN appointments a ON a.doctor_id = doc.user_id
            WHERE u.active = true
            GROUP BY doc.user_id, u.name, doc.specialization
            ORDER BY total DESC
            """;

        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql);
             ResultSet resultSet = preparedStatement.executeQuery()) {

            while (resultSet.next()) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("doctorName", resultSet.getString("doctor_name"));
                row.put("specialization", resultSet.getString("specialization"));
                row.put("total", resultSet.getLong("total"));
                row.put("completed", resultSet.getLong("completed"));
                row.put("pending", resultSet.getLong("pending"));
                row.put("cancelled", resultSet.getLong("cancelled"));
                doctorStats.add(row);
            }

        } catch (SQLException e) {
            System.err.println("JDBC Error in getDoctorWiseReport: " + e.getMessage());
        }

        report.put("doctorStats", doctorStats);
        return report;
    }

    /**
     * Get department statistics using raw JDBC.
     */
    public Map<String, Object> getDepartmentStats() {
        Map<String, Object> report = new LinkedHashMap<>();
        List<Map<String, Object>> deptStats = new ArrayList<>();

        String sql = """
            SELECT dep.name AS department_name,
                   COUNT(DISTINCT doc.user_id) AS doctor_count,
                   COUNT(DISTINCT a.id) AS appointment_count
            FROM departments dep
            LEFT JOIN doctors doc ON doc.department_id = dep.id
            LEFT JOIN appointments a ON a.doctor_id = doc.user_id
            WHERE dep.active = true
            GROUP BY dep.id, dep.name
            ORDER BY appointment_count DESC
            """;

        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql);
             ResultSet resultSet = preparedStatement.executeQuery()) {

            while (resultSet.next()) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("departmentName", resultSet.getString("department_name"));
                row.put("doctorCount", resultSet.getLong("doctor_count"));
                row.put("appointmentCount", resultSet.getLong("appointment_count"));
                deptStats.add(row);
            }

        } catch (SQLException e) {
            System.err.println("JDBC Error in getDepartmentStats: " + e.getMessage());
        }

        report.put("departmentStats", deptStats);
        return report;
    }
}
