-- =====================================================================
-- Healix Hospital Management System - Sample Data
-- =====================================================================
-- IMPORTANT: Run schema.sql FIRST, then this file.
-- Passwords are BCrypt encoded. Plain text passwords:
--   Admin:   Admin@123
--   Doctors: Doctor@123
--   Patients: Patient@123
-- =====================================================================

USE healix_db;

-- ---- Departments ----
INSERT INTO departments (name, description, icon_class, active) VALUES
('Cardiology', 'Expert care for heart and cardiovascular conditions', 'bi-heart-pulse', 1),
('Neurology', 'Diagnosis and treatment of nervous system disorders', 'bi-activity', 1),
('Orthopedics', 'Bone, joint, and musculoskeletal care', 'bi-bandaid', 1),
('Pediatrics', 'Comprehensive care for infants, children and adolescents', 'bi-emoji-smile', 1),
('Gynecology', 'Women''s reproductive health and maternity care', 'bi-gender-female', 1),
('Dermatology', 'Skin, hair, and nail disorders treatment', 'bi-clipboard2-heart', 1),
('Ophthalmology', 'Eye care and vision health services', 'bi-eye', 1),
('General Medicine', 'Primary healthcare and general consultations', 'bi-hospital', 1);

-- ---- Admin User ----
-- Password: Admin@123
INSERT INTO users (name, email, password, phone, address, role, active, created_at) VALUES
('Dr. Ananya Krishnan', 'admin@healix.com',
 '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lkii',
 '9876543210', 'Healix Hospital, Health City, Kerala', 'ROLE_ADMIN', 1, NOW());

INSERT INTO admins (user_id, employee_id, designation) VALUES (LAST_INSERT_ID(), 'EMP001', 'Chief Administrator');

-- ---- Doctor Users ----
-- Password: Doctor@123
INSERT INTO users (name, email, password, phone, address, role, active, created_at) VALUES
('Dr. Rajesh Kumar', 'doctor@healix.com',
 '$2a$12$TwkHs3O3UB.l8r3c3P.uteX77RFTO2fRhgJgbpJhbHi05XHOKVMey',
 '9876501234', 'Doctor Quarters, Health City, Kerala', 'ROLE_DOCTOR', 1, NOW());
SET @doctor1_id = LAST_INSERT_ID();
INSERT INTO doctors (user_id, specialization, qualification, bio, experience_years, consultation_fee, availability, department_id)
VALUES (@doctor1_id, 'Cardiology', 'MBBS, MD (Cardiology), DM (Cardiology)',
        'Senior cardiologist with 15 years of experience in interventional cardiology.',
        15, 800.00, 'Mon-Sat: 9AM-1PM, 3PM-6PM', 1);

INSERT INTO users (name, email, password, phone, address, role, active, created_at) VALUES
('Dr. Priya Nair', 'priya.nair@healix.com',
 '$2a$12$TwkHs3O3UB.l8r3c3P.uteX77RFTO2fRhgJgbpJhbHi05XHOKVMey',
 '9876502345', 'Doctor Quarters, Health City, Kerala', 'ROLE_DOCTOR', 1, NOW());
SET @doctor2_id = LAST_INSERT_ID();
INSERT INTO doctors (user_id, specialization, qualification, bio, experience_years, consultation_fee, availability, department_id)
VALUES (@doctor2_id, 'Neurology', 'MBBS, MD (Medicine), DM (Neurology)',
        'Expert neurologist specializing in stroke management and epilepsy treatment.',
        10, 900.00, 'Mon-Fri: 10AM-2PM, 4PM-7PM', 2);

INSERT INTO users (name, email, password, phone, address, role, active, created_at) VALUES
('Dr. Suresh Menon', 'suresh.menon@healix.com',
 '$2a$12$TwkHs3O3UB.l8r3c3P.uteX77RFTO2fRhgJgbpJhbHi05XHOKVMey',
 '9876503456', 'Doctor Quarters, Health City, Kerala', 'ROLE_DOCTOR', 1, NOW());
SET @doctor3_id = LAST_INSERT_ID();
INSERT INTO doctors (user_id, specialization, qualification, bio, experience_years, consultation_fee, availability, department_id)
VALUES (@doctor3_id, 'Orthopedics', 'MBBS, MS (Ortho), Fellowship (Joint Replacement)',
        'Specialist in joint replacement surgeries and sports medicine.',
        12, 750.00, 'Mon-Sat: 9AM-12PM, 2PM-5PM', 3);

INSERT INTO users (name, email, password, phone, address, role, active, created_at) VALUES
('Dr. Meera Thomas', 'meera.thomas@healix.com',
 '$2a$12$TwkHs3O3UB.l8r3c3P.uteX77RFTO2fRhgJgbpJhbHi05XHOKVMey',
 '9876504567', 'Doctor Quarters, Health City, Kerala', 'ROLE_DOCTOR', 1, NOW());
SET @doctor4_id = LAST_INSERT_ID();
INSERT INTO doctors (user_id, specialization, qualification, bio, experience_years, consultation_fee, availability, department_id)
VALUES (@doctor4_id, 'Pediatrics', 'MBBS, MD (Pediatrics), Fellowship (Neonatology)',
        'Dedicated pediatrician caring for children from birth through adolescence.',
        8, 600.00, 'Mon-Fri: 9AM-1PM, 3PM-6PM', 4);

INSERT INTO users (name, email, password, phone, address, role, active, created_at) VALUES
('Dr. Kavitha Pillai', 'kavitha.pillai@healix.com',
 '$2a$12$TwkHs3O3UB.l8r3c3P.uteX77RFTO2fRhgJgbpJhbHi05XHOKVMey',
 '9876505678', 'Doctor Quarters, Health City, Kerala', 'ROLE_DOCTOR', 1, NOW());
SET @doctor5_id = LAST_INSERT_ID();
INSERT INTO doctors (user_id, specialization, qualification, bio, experience_years, consultation_fee, availability, department_id)
VALUES (@doctor5_id, 'General Medicine', 'MBBS, MD (General Medicine)',
        'General practitioner providing comprehensive primary healthcare.',
        6, 500.00, 'Mon-Sat: 8AM-2PM, 4PM-7PM', 8);

-- ---- Patient Users ----
-- Password: Patient@123
INSERT INTO users (name, email, password, phone, address, role, active, created_at) VALUES
('Arun Chandran', 'patient@healix.com',
 '$2a$12$m/wkiJ2vH7GnxBV5TJEkfeXVHiZ0SovJLBe.V0lQ1nqsI2N1VsO7W',
 '9876510001', 'Flat 4B, Sunrise Apartments, Kakkanad, Kochi', 'ROLE_PATIENT', 1, NOW());
SET @patient1_id = LAST_INSERT_ID();
INSERT INTO patients (user_id, date_of_birth, gender, blood_group, emergency_contact, emergency_contact_name)
VALUES (@patient1_id, '1990-05-15', 'MALE', 'B_POSITIVE', '9876510002', 'Sitha Chandran');

INSERT INTO users (name, email, password, phone, address, role, active, created_at) VALUES
('Divya Rajan', 'divya.rajan@healix.com',
 '$2a$12$m/wkiJ2vH7GnxBV5TJEkfeXVHiZ0SovJLBe.V0lQ1nqsI2N1VsO7W',
 '9876510003', 'TC 15/1234, Kowdiar, Thiruvananthapuram', 'ROLE_PATIENT', 1, NOW());
SET @patient2_id = LAST_INSERT_ID();
INSERT INTO patients (user_id, date_of_birth, gender, blood_group, emergency_contact, emergency_contact_name)
VALUES (@patient2_id, '1985-11-22', 'FEMALE', 'A_POSITIVE', '9876510004', 'Ramesh Rajan');

INSERT INTO users (name, email, password, phone, address, role, active, created_at) VALUES
('Mohammed Faisal', 'faisal@healix.com',
 '$2a$12$m/wkiJ2vH7GnxBV5TJEkfeXVHiZ0SovJLBe.V0lQ1nqsI2N1VsO7W',
 '9876510005', '12/45, Beach Road, Kozhikode', 'ROLE_PATIENT', 1, NOW());
SET @patient3_id = LAST_INSERT_ID();
INSERT INTO patients (user_id, date_of_birth, gender, blood_group, emergency_contact, emergency_contact_name)
VALUES (@patient3_id, '1978-03-08', 'MALE', 'O_POSITIVE', '9876510006', 'Ayesha Faisal');

-- ---- Sample Appointments ----
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status, created_at) VALUES
(@patient1_id, @doctor1_id, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00', 'Chest pain and shortness of breath during exercise', 'CONFIRMED', NOW()),
(@patient1_id, @doctor3_id, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '09:30:00', 'Right knee pain after sports injury', 'PENDING', NOW()),
(@patient2_id, @doctor2_id, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '11:00:00', 'Recurring headaches and dizziness', 'CONFIRMED', NOW()),
(@patient2_id, @doctor4_id, DATE_SUB(CURDATE(), INTERVAL 5 DAY), '10:30:00', 'Child vaccination and routine checkup', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(@patient3_id, @doctor5_id, CURDATE(), '14:00:00', 'Fever, cough and cold symptoms', 'CONFIRMED', NOW()),
(@patient3_id, @doctor1_id, DATE_SUB(CURDATE(), INTERVAL 10 DAY), '09:00:00', 'Annual cardiac checkup', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 10 DAY));

-- ---- Sample Medical Records for completed appointments ----
INSERT INTO medical_records (appointment_id, patient_id, doctor_id, symptoms, diagnosis, treatment, notes, created_at)
SELECT a.id, a.patient_id, a.doctor_id,
       'Fatigue, mild chest discomfort, elevated BP 140/90',
       'Hypertension Stage 1, Mild cardiac stress',
       'Antihypertensive medication, low sodium diet, moderate exercise',
       'Patient advised to monitor BP daily. Follow-up in 4 weeks.',
       a.created_at
FROM appointments a WHERE a.status = 'COMPLETED' LIMIT 1;

SET @record1_id = LAST_INSERT_ID();

INSERT INTO prescriptions (medical_record_id, medicine_name, dosage, frequency, duration, instructions) VALUES
(@record1_id, 'Amlodipine', '5mg', 'Once daily', '30 days', 'Take in the morning with water'),
(@record1_id, 'Aspirin', '75mg', 'Once daily', '30 days', 'Take after food'),
(@record1_id, 'Rosuvastatin', '10mg', 'Once daily at night', '30 days', 'Avoid grapefruit juice');

-- ---- Sample Notifications ----
INSERT INTO notifications (user_id, message, type, is_read, created_at)
SELECT @patient1_id, 'Welcome to Healix! Your account has been created successfully.', 'GENERAL', 0, NOW();

INSERT INTO notifications (user_id, message, type, is_read, created_at)
SELECT @patient1_id, 'Your appointment with Dr. Rajesh Kumar on tomorrow at 10:00 AM has been confirmed.', 'APPOINTMENT_CONFIRMED', 0, NOW();
