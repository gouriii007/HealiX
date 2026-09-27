package com.healix.hms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Healix Hospital Management System
 * ===================================
 * Main entry point for the Spring Boot application.
 *
 * OOP Demonstrated:
 *   - Packages: com.healix.hms and sub-packages
 *   - Java 21 features throughout the application
 *
 * Technology Stack:
 *   - Java 21 LTS
 *   - Spring Boot 3.x
 *   - Spring MVC + Thymeleaf
 *   - Spring Data JPA + Hibernate
 *   - Spring Security
 *   - Supabase PostgreSQL (PostgreSQL 17)
 *
 * KTU B.Tech CSE S3 2024 Scheme OOP Project
 */
@SpringBootApplication
public class HealixApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(HealixApplication.class, args);
        System.out.println("==============================================");
        System.out.println("  Healix Hospital Management System Started  ");
        System.out.println("  Database: Supabase PostgreSQL               ");
        System.out.println("  URL: http://localhost:8080                 ");
        System.out.println("  Admin: admin@healix.com / Admin@123        ");
        System.out.println("  Doctor: doctor@healix.com / Doctor@123     ");
        System.out.println("  Patient: patient@healix.com / Patient@123  ");
        System.out.println("==============================================");
    }

    /**
     * Helper to load .env file if present in working directory or parent directories.
     * Does not overwrite existing environment variables or system properties.
     */
    private static void loadDotEnv() {
        String[] candidates = {".env", "../.env", "../../.env", "Backend/healix-backend/.env"};
        for (String candidate : candidates) {
            java.io.File file = new java.io.File(candidate);
            if (file.exists() && file.isFile()) {
                try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.FileReader(file))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (System.getenv(key) == null && System.getProperty(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                    System.out.println("[Healix HMS] Loaded environment variables from: " + file.getAbsolutePath());
                    break;
                } catch (Exception ignored) {
                }
            }
        }
    }
}
