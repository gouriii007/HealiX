-- =====================================================================
-- Healix Hospital Management System - Database Schema
-- =====================================================================
-- Run this script to create the database structure manually.
-- Spring Boot with JPA (ddl-auto=update) will also create tables.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS healix_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE healix_db;

-- Users table (base table for inheritance)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    address VARCHAR(255),
    role VARCHAR(20) NOT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    icon_class VARCHAR(50),
    active TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id)
);

-- Admins table (inherits from users via JOINED strategy)
CREATE TABLE IF NOT EXISTS admins (
    user_id BIGINT NOT NULL,
    employee_id VARCHAR(50) UNIQUE,
    designation VARCHAR(100),
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Doctors table (inherits from users via JOINED strategy)
CREATE TABLE IF NOT EXISTS doctors (
    user_id BIGINT NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    qualification VARCHAR(200) NOT NULL,
    bio VARCHAR(500),
    experience_years INT,
    consultation_fee DECIMAL(10,2),
    availability VARCHAR(200),
    profile_image VARCHAR(255),
    department_id BIGINT,
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Patients table (inherits from users via JOINED strategy)
CREATE TABLE IF NOT EXISTS patients (
    user_id BIGINT NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    blood_group VARCHAR(10),
    emergency_contact VARCHAR(15),
    emergency_contact_name VARCHAR(100),
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT NOT NULL AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason VARCHAR(500) NOT NULL,
    doctor_notes VARCHAR(1000),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (patient_id) REFERENCES patients(user_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(user_id),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_appointment_doctor (doctor_id),
    INDEX idx_appointment_patient (patient_id),
    INDEX idx_appointment_status (status)
);

-- Medical Records table
CREATE TABLE IF NOT EXISTS medical_records (
    id BIGINT NOT NULL AUTO_INCREMENT,
    appointment_id BIGINT NOT NULL UNIQUE,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    symptoms VARCHAR(500),
    diagnosis VARCHAR(500),
    treatment VARCHAR(1000),
    notes VARCHAR(1000),
    follow_up_date DATE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (patient_id) REFERENCES patients(user_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(user_id),
    INDEX idx_record_patient (patient_id)
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    medical_record_id BIGINT NOT NULL,
    medicine_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    instructions VARCHAR(500),
    PRIMARY KEY (id),
    FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
    INDEX idx_prescription_record (medical_record_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    message VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notification_user (user_id),
    INDEX idx_notification_read (is_read)
);
