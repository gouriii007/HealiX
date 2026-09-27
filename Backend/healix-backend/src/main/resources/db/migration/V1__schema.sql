-- =====================================================================
-- Healix Hospital Management System - Supabase PostgreSQL Schema (V1)
-- =====================================================================

-- 1. Hospitals table (Multi-hospital platform foundation)
CREATE TABLE IF NOT EXISTS hospitals (
    id BIGSERIAL PRIMARY KEY,
    hospital_code VARCHAR(50) NOT NULL UNIQUE,
    hospital_name VARCHAR(150) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(100) DEFAULT 'Thiruvananthapuram',
    district VARCHAR(100) DEFAULT 'Thiruvananthapuram',
    state VARCHAR(100) DEFAULT 'Kerala',
    pincode VARCHAR(10) DEFAULT '695001',
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(150),
    description VARCHAR(1000),
    logo VARCHAR(255),
    registration_number VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    registration_fee DECIMAL(10,2) DEFAULT 250.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_hospital_code ON hospitals (hospital_code);
CREATE INDEX IF NOT EXISTS idx_hospital_status ON hospitals (status);
CREATE INDEX IF NOT EXISTS idx_hospital_district ON hospitals (district);

-- 2. Users table (base table for joined inheritance)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    address VARCHAR(255),
    role VARCHAR(30) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_user_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_user_role ON users (role);

-- 3. Departments table
CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    hospital_id BIGINT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    icon_class VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_dept_hospital ON departments (hospital_id);

-- 4. Admins table (inherits from users via JOINED strategy)
CREATE TABLE IF NOT EXISTS admins (
    user_id BIGINT NOT NULL PRIMARY KEY,
    hospital_id BIGINT,
    employee_id VARCHAR(50) UNIQUE,
    designation VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_admin_hospital ON admins (hospital_id);

-- 5. Doctors table (inherits from users via JOINED strategy)
CREATE TABLE IF NOT EXISTS doctors (
    user_id BIGINT NOT NULL PRIMARY KEY,
    hospital_id BIGINT,
    doctor_code VARCHAR(50),
    specialization VARCHAR(100) NOT NULL,
    qualification VARCHAR(200) NOT NULL,
    bio VARCHAR(500),
    experience_years INT,
    consultation_fee DECIMAL(10,2),
    availability VARCHAR(200),
    profile_image VARCHAR(255),
    department_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_doctor_hospital ON doctors (hospital_id);

-- 6. Patients table (inherits from users via JOINED strategy)
CREATE TABLE IF NOT EXISTS patients (
    user_id BIGINT NOT NULL PRIMARY KEY,
    patient_identifier VARCHAR(50),
    nic VARCHAR(50),
    date_of_birth DATE,
    gender VARCHAR(10),
    blood_group VARCHAR(10),
    emergency_contact VARCHAR(15),
    emergency_contact_name VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_patient_identifier ON patients (patient_identifier);

-- 7. Patient-Hospital Junction Table (Multi-Hospital Identity)
CREATE TABLE IF NOT EXISTS patient_hospitals (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    hospital_id BIGINT NOT NULL,
    hospital_patient_number VARCHAR(50) NOT NULL,
    registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    registration_slip_id VARCHAR(100),
    CONSTRAINT uk_patient_hospital UNIQUE (patient_id, hospital_id),
    FOREIGN KEY (patient_id) REFERENCES patients(user_id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_ph_patient ON patient_hospitals (patient_id);
CREATE INDEX IF NOT EXISTS idx_ph_hospital ON patient_hospitals (hospital_id);

-- 8. Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    hospital_id BIGINT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason VARCHAR(500) NOT NULL,
    doctor_notes VARCHAR(1000),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(user_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(user_id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_appointment_date ON appointments (appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointment_doctor ON appointments (doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointment_patient ON appointments (patient_id);
CREATE INDEX IF NOT EXISTS idx_appointment_hospital ON appointments (hospital_id);
CREATE INDEX IF NOT EXISTS idx_appointment_status ON appointments (status);

-- 9. Medical Records table
CREATE TABLE IF NOT EXISTS medical_records (
    id BIGSERIAL PRIMARY KEY,
    appointment_id BIGINT NOT NULL UNIQUE,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    hospital_id BIGINT,
    symptoms VARCHAR(500),
    diagnosis VARCHAR(500),
    treatment VARCHAR(1000),
    notes VARCHAR(1000),
    follow_up_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (patient_id) REFERENCES patients(user_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(user_id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_record_patient ON medical_records (patient_id);
CREATE INDEX IF NOT EXISTS idx_record_hospital ON medical_records (hospital_id);

-- 10. Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id BIGSERIAL PRIMARY KEY,
    medical_record_id BIGINT NOT NULL,
    prescription_code VARCHAR(50),
    medicine_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    route VARCHAR(50) DEFAULT 'Oral',
    instructions VARCHAR(500),
    FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_prescription_record ON prescriptions (medical_record_id);

-- 11. Payments table
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    payment_reference VARCHAR(60) NOT NULL UNIQUE,
    patient_id BIGINT NOT NULL,
    hospital_id BIGINT NOT NULL,
    appointment_id BIGINT,
    amount DECIMAL(10,2) NOT NULL,
    payment_type VARCHAR(30) NOT NULL,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    receipt_number VARCHAR(60),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(user_id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);
CREATE INDEX IF NOT EXISTS idx_payment_patient ON payments (patient_id);
CREATE INDEX IF NOT EXISTS idx_payment_hospital ON payments (hospital_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payments (payment_status);

-- 12. OTP Verifications table
CREATE TABLE IF NOT EXISTS otp_verifications (
    id BIGSERIAL PRIMARY KEY,
    identifier VARCHAR(150) NOT NULL,
    otp_code VARCHAR(100) NOT NULL,
    purpose VARCHAR(30) NOT NULL DEFAULT 'REGISTRATION',
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    attempts INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_otp_identifier ON otp_verifications (identifier);

-- 13. Record Access Requests table (Cross-hospital patient consent)
CREATE TABLE IF NOT EXISTS record_access_requests (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    requesting_doctor_id BIGINT NOT NULL,
    source_hospital_id BIGINT NOT NULL,
    target_hospital_id BIGINT NOT NULL,
    record_type VARCHAR(100) DEFAULT 'COMPLETE_HISTORY',
    reason VARCHAR(500) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(user_id),
    FOREIGN KEY (requesting_doctor_id) REFERENCES doctors(user_id),
    FOREIGN KEY (source_hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (target_hospital_id) REFERENCES hospitals(id)
);
CREATE INDEX IF NOT EXISTS idx_consent_patient ON record_access_requests (patient_id);
CREATE INDEX IF NOT EXISTS idx_consent_doctor ON record_access_requests (requesting_doctor_id);

-- 14. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    hospital_id BIGINT,
    title VARCHAR(200) DEFAULT 'Notification',
    message VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_notification_user ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notification_hospital ON notifications (hospital_id);
CREATE INDEX IF NOT EXISTS idx_notification_read ON notifications (is_read);

-- 15. Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    user_email VARCHAR(150),
    hospital_id BIGINT,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(100),
    ip_address VARCHAR(45),
    details VARCHAR(1000),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_hospital ON audit_logs (hospital_id);
