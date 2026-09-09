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
 *   - MySQL 8.x
 *
 * KTU B.Tech CSE S3 2024 Scheme OOP Project
 */
@SpringBootApplication
public class HealixApplication {

    public static void main(String[] args) {
        SpringApplication.run(HealixApplication.class, args);
        System.out.println("==============================================");
        System.out.println("  Healix Hospital Management System Started  ");
        System.out.println("  URL: http://localhost:8080                 ");
        System.out.println("  Admin: admin@healix.com / Admin@123        ");
        System.out.println("  Doctor: doctor@healix.com / Doctor@123     ");
        System.out.println("  Patient: patient@healix.com / Patient@123  ");
        System.out.println("==============================================");
    }
}
