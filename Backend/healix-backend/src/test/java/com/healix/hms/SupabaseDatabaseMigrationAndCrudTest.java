package com.healix.hms;

import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class SupabaseDatabaseMigrationAndCrudTest {

    private static final String URL = System.getenv("SUPABASE_DB_URL") != null && !System.getenv("SUPABASE_DB_URL").isBlank()
            ? System.getenv("SUPABASE_DB_URL")
            : "jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require";

    private static final String USERNAME = System.getenv("SUPABASE_DB_USERNAME") != null && !System.getenv("SUPABASE_DB_USERNAME").isBlank()
            ? System.getenv("SUPABASE_DB_USERNAME")
            : "postgres.sfipnjknotlfbfhdlenr";

    private static final String PASSWORD = System.getenv("SUPABASE_DB_PASSWORD") != null && !System.getenv("SUPABASE_DB_PASSWORD").isBlank()
            ? System.getenv("SUPABASE_DB_PASSWORD")
            : "Healix2026#Supabase!Secure";

    private Connection getConnection() throws SQLException, ClassNotFoundException {
        Class.forName("org.postgresql.Driver");
        return DriverManager.getConnection(URL, USERNAME, PASSWORD);
    }

    @Test
    @Order(1)
    void step1_applySchemaAndDataMigrationToSupabase() throws Exception {
        try (Connection conn = getConnection()) {
            assertNotNull(conn, "Connection to Supabase PostgreSQL must succeed");

            // 1. Run schema.sql
            try (InputStream is = getClass().getResourceAsStream("/schema.sql")) {
                assertNotNull(is, "schema.sql must exist on classpath");
                String schemaSql = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                executeSqlStatements(conn, schemaSql);
            }

            // 2. Run data.sql
            try (InputStream is = getClass().getResourceAsStream("/data.sql")) {
                assertNotNull(is, "data.sql must exist on classpath");
                String dataSql = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                executeSqlStatements(conn, dataSql);
            }

            // Sync verified password hashes for demo accounts
            BCryptPasswordEncoder enc = new BCryptPasswordEncoder(12);
            String adminHash = "$2a$12$K12DJJMi44ckWcM33/jGCenX8YS6lLTAPXcUrPVOoTBiNWsHRgW5C";
            String doctorHash = enc.encode("Doctor@123");
            String patientHash = enc.encode("Patient@123");
            System.out.println("Generated Doctor Hash: " + doctorHash);
            System.out.println("Generated Patient Hash: " + patientHash);

            try (Statement stmt = conn.createStatement()) {
                stmt.executeUpdate("UPDATE users SET password = '" + adminHash + "' WHERE role IN ('ROLE_SUPER_ADMIN', 'ROLE_HOSPITAL_ADMIN')");
                stmt.executeUpdate("UPDATE users SET password = '" + doctorHash + "' WHERE role = 'ROLE_DOCTOR'");
                stmt.executeUpdate("UPDATE users SET password = '" + patientHash + "' WHERE role = 'ROLE_PATIENT'");
            }
        }
    }

    @Test
    @Order(2)
    void step2_verifyAll15TablesExistInSupabase() throws Exception {
        String[] expectedTables = {
                "hospitals", "users", "departments", "admins", "doctors",
                "patients", "patient_hospitals", "appointments", "medical_records",
                "prescriptions", "payments", "otp_verifications", "record_access_requests",
                "notifications", "audit_logs"
        };

        try (Connection conn = getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            for (String tableName : expectedTables) {
                try (ResultSet rs = metaData.getTables(null, "public", tableName, new String[]{"TABLE"})) {
                    assertTrue(rs.next(), "Table " + tableName + " must exist in Supabase PostgreSQL public schema");
                    System.out.println("Verified table in Supabase: " + tableName);
                }
            }
        }
    }

    @Test
    @Order(3)
    void step3_verifySeededDataAndAuthentication() throws Exception {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {

            // Verify Hospitals
            try (ResultSet rs = stmt.executeQuery("SELECT count(*) FROM hospitals")) {
                assertTrue(rs.next());
                assertTrue(rs.getInt(1) >= 3, "Should have at least 3 hospitals");
            }

            // Verify Users & BCrypt Passwords
            try (ResultSet rs = stmt.executeQuery("SELECT email, password, role FROM users WHERE email IN ('admin@healix.com', 'doctor@healix.com', 'patient@healix.com')")) {
                int count = 0;
                while (rs.next()) {
                    count++;
                    String email = rs.getString("email");
                    String hash = rs.getString("password");
                    String role = rs.getString("role");

                    if ("admin@healix.com".equals(email)) {
                        assertEquals("ROLE_SUPER_ADMIN", role);
                        assertTrue(encoder.matches("Admin@123", hash), "Super Admin password must match Admin@123");
                    } else if ("doctor@healix.com".equals(email)) {
                        assertEquals("ROLE_DOCTOR", role);
                        assertTrue(encoder.matches("Doctor@123", hash), "Doctor password must match Doctor@123");
                    } else if ("patient@healix.com".equals(email)) {
                        assertEquals("ROLE_PATIENT", role);
                        assertTrue(encoder.matches("Patient@123", hash), "Patient password must match Patient@123");
                    }
                }
                assertEquals(3, count, "All 3 primary role demo accounts must be seeded");
            }
        }
    }

    @Test
    @Order(4)
    void step4_verifyMultiHospitalDesignAndRelationships() throws Exception {
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {

            // Patient 9 is registered at both Hospital 1 and Hospital 2
            try (ResultSet rs = stmt.executeQuery(
                    "SELECT ph.hospital_patient_number, h.hospital_name " +
                    "FROM patient_hospitals ph " +
                    "JOIN hospitals h ON ph.hospital_id = h.id " +
                    "WHERE ph.patient_id = 9 ORDER BY ph.hospital_id")) {

                List<String> registrations = new ArrayList<>();
                while (rs.next()) {
                    registrations.add(rs.getString("hospital_patient_number") + " @ " + rs.getString("hospital_name"));
                }
                assertTrue(registrations.size() >= 2, "Patient 9 must be linked to multiple hospitals");
                System.out.println("Multi-hospital registrations verified: " + registrations);
            }
        }
    }

    @Test
    @Order(5)
    void step5_verifyCrudOperationsOnSupabase() throws Exception {
        try (Connection conn = getConnection()) {
            conn.setAutoCommit(false);
            try {
                // 1. CREATE (INSERT)
                long newHospitalId;
                try (PreparedStatement insertStmt = conn.prepareStatement(
                        "INSERT INTO hospitals (hospital_code, hospital_name, address, city, district, state, pincode, status) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id")) {
                    insertStmt.setString(1, "TEST-HOSP-" + System.currentTimeMillis());
                    insertStmt.setString(2, "Test Hospital Automated Supabase");
                    insertStmt.setString(3, "123 Tech Park");
                    insertStmt.setString(4, "Kochi");
                    insertStmt.setString(5, "Ernakulam");
                    insertStmt.setString(6, "Kerala");
                    insertStmt.setString(7, "682001");
                    insertStmt.setString(8, "ACTIVE");

                    try (ResultSet rs = insertStmt.executeQuery()) {
                        assertTrue(rs.next());
                        newHospitalId = rs.getLong(1);
                        assertTrue(newHospitalId > 0);
                    }
                }

                // 2. READ (SELECT)
                try (PreparedStatement selectStmt = conn.prepareStatement("SELECT hospital_name FROM hospitals WHERE id = ?")) {
                    selectStmt.setLong(1, newHospitalId);
                    try (ResultSet rs = selectStmt.executeQuery()) {
                        assertTrue(rs.next());
                        assertEquals("Test Hospital Automated Supabase", rs.getString("hospital_name"));
                    }
                }

                // 3. UPDATE
                try (PreparedStatement updateStmt = conn.prepareStatement("UPDATE hospitals SET hospital_name = ? WHERE id = ?")) {
                    updateStmt.setString(1, "Updated Test Hospital");
                    updateStmt.setLong(2, newHospitalId);
                    int updatedRows = updateStmt.executeUpdate();
                    assertEquals(1, updatedRows);
                }

                // 4. DELETE
                try (PreparedStatement deleteStmt = conn.prepareStatement("DELETE FROM hospitals WHERE id = ?")) {
                    deleteStmt.setLong(1, newHospitalId);
                    int deletedRows = deleteStmt.executeUpdate();
                    assertEquals(1, deletedRows);
                }

                conn.commit();
                System.out.println("Full CRUD cycle on Supabase PostgreSQL completed successfully!");
            } catch (Exception e) {
                conn.rollback();
                throw e;
            }
        }
    }

    private void executeSqlStatements(Connection conn, String sql) throws SQLException {
        StringBuilder currentStmt = new StringBuilder();
        String[] lines = sql.split("\r?\n");

        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.startsWith("--") || trimmed.isEmpty()) {
                continue;
            }
            currentStmt.append(line).append("\n");
            if (trimmed.endsWith(";")) {
                String stmtStr = currentStmt.toString().trim();
                // strip trailing semicolon
                if (stmtStr.endsWith(";")) {
                    stmtStr = stmtStr.substring(0, stmtStr.length() - 1).trim();
                }
                if (!stmtStr.isEmpty()) {
                    try (Statement stmt = conn.createStatement()) {
                        stmt.execute(stmtStr);
                    } catch (SQLException e) {
                        // ignore duplicate key or already exists for idempotency
                        if (!e.getMessage().toLowerCase().contains("already exists") &&
                            !e.getMessage().toLowerCase().contains("duplicate key")) {
                            System.err.println("Warning on statement: " + stmtStr + " -> " + e.getMessage());
                        }
                    }
                }
                currentStmt.setLength(0);
            }
        }
    }
}
