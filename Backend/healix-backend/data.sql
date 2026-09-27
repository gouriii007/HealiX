-- =====================================================================
-- Healix Hospital Management System - PostgreSQL / Supabase Sample Data
-- =====================================================================

-- ---- Hospitals in Thiruvananthapuram, Kerala ----
INSERT INTO hospitals (id, hospital_code, hospital_name, address, city, district, state, pincode, phone, email, website, description, status, registration_fee, created_at)
VALUES
(1, 'TRV-HOSP-01', 'MediCare City Hospital', 'MG Road, Statue, Thiruvananthapuram', 'Thiruvananthapuram', 'Thiruvananthapuram', 'Kerala', '695001', '0471-2471000', 'contact@medicarecity.org', 'https://medicarecity.org', 'Premier tertiary care multi-speciality hospital equipped with state-of-the-art cardiology and neurology wings.', 'ACTIVE', 250.00, CURRENT_TIMESTAMP),
(2, 'TRV-HOSP-02', 'Trivandrum Medical Trust', 'Pattom Palace PO, Medical College Road, Thiruvananthapuram', 'Thiruvananthapuram', 'Thiruvananthapuram', 'Kerala', '695004', '0471-2552000', 'info@tvmmedicaltrust.org', 'https://tvmmedicaltrust.org', 'Renowned non-profit healthcare trust offering comprehensive pediatrics, general medicine, and emergency care.', 'ACTIVE', 200.00, CURRENT_TIMESTAMP),
(3, 'TRV-HOSP-03', 'Sree Chitra Speciality Hospital', 'Kumarapuram, Medical College, Thiruvananthapuram', 'Thiruvananthapuram', 'Thiruvananthapuram', 'Kerala', '695011', '0471-2524000', 'care@sreechitraspeciality.org', 'https://sreechitraspeciality.org', 'Advanced surgical, orthopedic, and neurosciences center delivering super-speciality patient treatment.', 'ACTIVE', 300.00, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- ---- Departments ----
INSERT INTO departments (id, hospital_id, name, description, icon_class, active)
VALUES
(1, 1, 'Cardiology', 'Expert care for heart and cardiovascular conditions', 'bi-heart-pulse', TRUE),
(2, 1, 'Neurology', 'Diagnosis and treatment of nervous system disorders', 'bi-activity', TRUE),
(3, 1, 'Orthopedics', 'Bone, joint, and musculoskeletal care', 'bi-bandaid', TRUE),
(4, 2, 'Pediatrics', 'Comprehensive care for infants, children and adolescents', 'bi-emoji-smile', TRUE),
(5, 2, 'Gynecology', 'Women''s reproductive health and maternity care', 'bi-gender-female', TRUE),
(6, 3, 'Dermatology', 'Skin, hair, and nail disorders treatment', 'bi-clipboard2-heart', TRUE),
(7, 3, 'Ophthalmology', 'Eye care and vision health services', 'bi-eye', TRUE),
(8, 1, 'General Medicine', 'Primary healthcare and general consultations', 'bi-hospital', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Update departments hospital_id if necessary
UPDATE departments SET hospital_id = 1 WHERE hospital_id IS NULL AND id IN (1, 2, 3, 8);
UPDATE departments SET hospital_id = 2 WHERE hospital_id IS NULL AND id IN (4, 5);
UPDATE departments SET hospital_id = 3 WHERE hospital_id IS NULL AND id IN (6, 7);

-- ---- Platform Super Admin User (Password: Admin@123) ----
INSERT INTO users (id, name, email, password, phone, address, role, active, created_at)
VALUES
(1, 'Dr. Ananya Krishnan', 'admin@healix.com', '$2a$12$K12DJJMi44ckWcM33/jGCenX8YS6lLTAPXcUrPVOoTBiNWsHRgW5C', '9876543210', 'Healix Hospital Platform, Health City, Kerala', 'ROLE_SUPER_ADMIN', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO admins (user_id, hospital_id, employee_id, designation)
VALUES
(1, NULL, 'EMP001', 'Platform Chief Administrator')
ON CONFLICT (user_id) DO NOTHING;

-- ---- Hospital 1 Administrator (Password: Admin@123) ----
INSERT INTO users (id, name, email, password, phone, address, role, active, created_at)
VALUES
(2, 'Rahul Sharma', 'admin.medicare@healix.com', '$2a$12$K12DJJMi44ckWcM33/jGCenX8YS6lLTAPXcUrPVOoTBiNWsHRgW5C', '9876543211', 'MediCare City Hospital, MG Road, Trivandrum', 'ROLE_HOSPITAL_ADMIN', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO admins (user_id, hospital_id, employee_id, designation)
VALUES
(2, 1, 'H1-ADM01', 'Hospital Administrator - MediCare')
ON CONFLICT (user_id) DO NOTHING;

-- ---- Hospital 2 Administrator (Password: Admin@123) ----
INSERT INTO users (id, name, email, password, phone, address, role, active, created_at)
VALUES
(3, 'Lakshmi Varma', 'admin.tvm@healix.com', '$2a$12$K12DJJMi44ckWcM33/jGCenX8YS6lLTAPXcUrPVOoTBiNWsHRgW5C', '9876543212', 'Trivandrum Medical Trust, Pattom, Trivandrum', 'ROLE_HOSPITAL_ADMIN', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO admins (user_id, hospital_id, employee_id, designation)
VALUES
(3, 2, 'H2-ADM01', 'Hospital Administrator - TVM Medical Trust')
ON CONFLICT (user_id) DO NOTHING;

-- ---- Doctor Users (Password: Doctor@123) ----
INSERT INTO users (id, name, email, password, phone, address, role, active, created_at)
VALUES
(4, 'Dr. Rajesh Kumar', 'doctor@healix.com', '$2a$12$X1uA9Q7PDOg50t1ly.17zOgX.SnE9lLgY57Zy7f05s7uBw3Ks3lna', '9876501234', 'Doctor Quarters, Health City, Kerala', 'ROLE_DOCTOR', TRUE, CURRENT_TIMESTAMP),
(5, 'Dr. Priya Nair', 'priya.nair@healix.com', '$2a$12$X1uA9Q7PDOg50t1ly.17zOgX.SnE9lLgY57Zy7f05s7uBw3Ks3lna', '9876502345', 'Doctor Quarters, Health City, Kerala', 'ROLE_DOCTOR', TRUE, CURRENT_TIMESTAMP),
(6, 'Dr. Suresh Menon', 'suresh.menon@healix.com', '$2a$12$X1uA9Q7PDOg50t1ly.17zOgX.SnE9lLgY57Zy7f05s7uBw3Ks3lna', '9876503456', 'Doctor Quarters, Health City, Kerala', 'ROLE_DOCTOR', TRUE, CURRENT_TIMESTAMP),
(7, 'Dr. Meera Thomas', 'meera.thomas@healix.com', '$2a$12$X1uA9Q7PDOg50t1ly.17zOgX.SnE9lLgY57Zy7f05s7uBw3Ks3lna', '9876504567', 'Doctor Quarters, Health City, Kerala', 'ROLE_DOCTOR', TRUE, CURRENT_TIMESTAMP),
(8, 'Dr. Kavitha Pillai', 'kavitha.pillai@healix.com', '$2a$12$X1uA9Q7PDOg50t1ly.17zOgX.SnE9lLgY57Zy7f05s7uBw3Ks3lna', '9876505678', 'Doctor Quarters, Health City, Kerala', 'ROLE_DOCTOR', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO doctors (user_id, hospital_id, doctor_code, specialization, qualification, bio, experience_years, consultation_fee, availability, department_id)
VALUES
(4, 1, 'DOC-TRV-001', 'Cardiology', 'MBBS, MD (Cardiology), DM (Cardiology)', 'Senior cardiologist with 15 years of experience in interventional cardiology.', 15, 800.00, 'Mon-Sat: 9AM-1PM, 3PM-6PM', 1),
(5, 1, 'DOC-TRV-002', 'Neurology', 'MBBS, MD (Medicine), DM (Neurology)', 'Expert neurologist specializing in stroke management and epilepsy treatment.', 10, 900.00, 'Mon-Fri: 10AM-2PM, 4PM-7PM', 2),
(6, 3, 'DOC-TRV-003', 'Orthopedics', 'MBBS, MS (Ortho), Fellowship (Joint Replacement)', 'Specialist in joint replacement surgeries and sports medicine.', 12, 750.00, 'Mon-Sat: 9AM-12PM, 2PM-5PM', 3),
(7, 2, 'DOC-TRV-004', 'Pediatrics', 'MBBS, MD (Pediatrics), Fellowship (Neonatology)', 'Dedicated pediatrician caring for children from birth through adolescence.', 8, 600.00, 'Mon-Fri: 9AM-1PM, 3PM-6PM', 4),
(8, 2, 'DOC-TRV-005', 'General Medicine', 'MBBS, MD (General Medicine)', 'General practitioner providing comprehensive primary healthcare.', 6, 500.00, 'Mon-Sat: 8AM-2PM, 4PM-7PM', 8)
ON CONFLICT (user_id) DO NOTHING;

-- ---- Patient Users (Password: Patient@123) ----
INSERT INTO users (id, name, email, password, phone, address, role, active, created_at)
VALUES
(9, 'Arun Chandran', 'patient@healix.com', '$2a$12$7A64sKKZnSTJQWIJWLxYa.psDRr0Z61gR3WE8wJaQa4NRzYsJyx4y', '9876510001', 'Flat 4B, Sunrise Apartments, Kowdiar, Thiruvananthapuram', 'ROLE_PATIENT', TRUE, CURRENT_TIMESTAMP),
(10, 'Divya Rajan', 'divya.rajan@healix.com', '$2a$12$7A64sKKZnSTJQWIJWLxYa.psDRr0Z61gR3WE8wJaQa4NRzYsJyx4y', '9876510003', 'TC 15/1234, Vellayambalam, Thiruvananthapuram', 'ROLE_PATIENT', TRUE, CURRENT_TIMESTAMP),
(11, 'Mohammed Faisal', 'faisal@healix.com', '$2a$12$7A64sKKZnSTJQWIJWLxYa.psDRr0Z61gR3WE8wJaQa4NRzYsJyx4y', '9876510005', '12/45, Kazhakkoottam, Thiruvananthapuram', 'ROLE_PATIENT', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO patients (user_id, patient_identifier, nic, date_of_birth, gender, blood_group, emergency_contact, emergency_contact_name)
VALUES
(9, 'PAT-TRV-000001', 'NIC-KL-900515', '1990-05-15', 'MALE', 'B_POSITIVE', '9876510002', 'Sitha Chandran'),
(10, 'PAT-TRV-000002', 'NIC-KL-851122', '1985-11-22', 'FEMALE', 'A_POSITIVE', '9876510004', 'Ramesh Rajan'),
(11, 'PAT-TRV-000003', 'NIC-KL-780308', '1978-03-08', 'MALE', 'O_POSITIVE', '9876510006', 'Ayesha Faisal')
ON CONFLICT (user_id) DO NOTHING;

-- ---- Patient Hospital Registrations ----
INSERT INTO patient_hospitals (id, patient_id, hospital_id, hospital_patient_number, registered_at, status, registration_slip_id)
VALUES
(1, 9, 1, 'TRV-HOSP-01-P-0001', CURRENT_TIMESTAMP - INTERVAL '30 days', 'ACTIVE', 'REC-TRV-REG001'),
(2, 9, 2, 'TRV-HOSP-02-P-0042', CURRENT_TIMESTAMP - INTERVAL '10 days', 'ACTIVE', 'REC-TRV-REG002'),
(3, 10, 1, 'TRV-HOSP-01-P-0002', CURRENT_TIMESTAMP - INTERVAL '20 days', 'ACTIVE', 'REC-TRV-REG003'),
(4, 11, 2, 'TRV-HOSP-02-P-0043', CURRENT_TIMESTAMP - INTERVAL '15 days', 'ACTIVE', 'REC-TRV-REG004')
ON CONFLICT (id) DO NOTHING;

-- ---- Sample Appointments ----
INSERT INTO appointments (id, patient_id, doctor_id, hospital_id, appointment_date, appointment_time, reason, status, created_at)
VALUES
(1, 9, 4, 1, CURRENT_DATE + INTERVAL '1 day', '10:00:00', 'Chest pain and shortness of breath during exercise', 'CONFIRMED', CURRENT_TIMESTAMP),
(2, 9, 6, 3, CURRENT_DATE + INTERVAL '3 days', '09:30:00', 'Right knee pain after sports injury', 'PENDING', CURRENT_TIMESTAMP),
(3, 10, 5, 1, CURRENT_DATE + INTERVAL '2 days', '11:00:00', 'Recurring headaches and dizziness', 'CONFIRMED', CURRENT_TIMESTAMP),
(4, 10, 7, 2, CURRENT_DATE - INTERVAL '5 days', '10:30:00', 'Child vaccination and routine checkup', 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(5, 11, 8, 2, CURRENT_DATE, '14:00:00', 'Fever, cough and cold symptoms', 'CONFIRMED', CURRENT_TIMESTAMP),
(6, 11, 4, 1, CURRENT_DATE - INTERVAL '10 days', '09:00:00', 'Annual cardiac checkup', 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- Update any existing appointments to link to hospital_id
UPDATE appointments a SET hospital_id = d.hospital_id FROM doctors d WHERE a.doctor_id = d.user_id AND a.hospital_id IS NULL;

-- ---- Sample Medical Records ----
INSERT INTO medical_records (id, appointment_id, patient_id, doctor_id, hospital_id, symptoms, diagnosis, treatment, notes, created_at)
VALUES
(1, 4, 10, 7, 2,
 'Fatigue, mild chest discomfort, elevated BP 140/90',
 'Hypertension Stage 1, Mild cardiac stress',
 'Antihypertensive medication, low sodium diet, moderate exercise',
 'Patient advised to monitor BP daily. Follow-up in 4 weeks.',
 CURRENT_TIMESTAMP - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- ---- Prescriptions ----
INSERT INTO prescriptions (id, medical_record_id, prescription_code, medicine_name, dosage, frequency, duration, route, instructions)
VALUES
(1, 1, 'RX-TRV-000101', 'Amlodipine', '5mg', 'Once daily', '30 days', 'Oral', 'Take in the morning with water'),
(2, 1, 'RX-TRV-000102', 'Aspirin', '75mg', 'Once daily', '30 days', 'Oral', 'Take after food'),
(3, 1, 'RX-TRV-000103', 'Rosuvastatin', '10mg', 'Once daily at night', '30 days', 'Oral', 'Avoid grapefruit juice')
ON CONFLICT (id) DO NOTHING;

-- ---- Sample Payments ----
INSERT INTO payments (id, payment_reference, patient_id, hospital_id, appointment_id, amount, payment_type, payment_status, payment_method, transaction_id, receipt_number, created_at)
VALUES
(1, 'PAY-REF-1001', 9, 1, NULL, 250.00, 'REGISTRATION_FEE', 'SUCCESS', 'UPI', 'TXN-TRV-990101', 'REC-TRV-REG001', CURRENT_TIMESTAMP - INTERVAL '30 days'),
(2, 'PAY-REF-1002', 9, 2, NULL, 200.00, 'REGISTRATION_FEE', 'SUCCESS', 'CREDIT_CARD', 'TXN-TRV-990102', 'REC-TRV-REG002', CURRENT_TIMESTAMP - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- ---- Sample Cross-Hospital Consent Request ----
INSERT INTO record_access_requests (id, patient_id, requesting_doctor_id, source_hospital_id, target_hospital_id, record_type, reason, status, requested_at, approved_at, expires_at)
VALUES
(1, 9, 6, 1, 3, 'COMPLETE_HISTORY', 'Pre-operative cardiac history review prior to arthroscopy procedure', 'PENDING', CURRENT_TIMESTAMP, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- ---- Sample Notifications ----
INSERT INTO notifications (id, user_id, hospital_id, title, message, type, is_read, created_at)
VALUES
(1, 9, 1, 'Welcome', 'Welcome to MediCare Platform! Your central ID is PAT-TRV-000001.', 'GENERAL', FALSE, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Align sequences with current maximum ID values (so future inserts use next serial)
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1), true) WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname = 'users_id_seq');
SELECT setval('hospitals_id_seq', COALESCE((SELECT MAX(id) FROM hospitals), 1), true) WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname = 'hospitals_id_seq');
SELECT setval('departments_id_seq', COALESCE((SELECT MAX(id) FROM departments), 1), true) WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname = 'departments_id_seq');
SELECT setval('patient_hospitals_id_seq', COALESCE((SELECT MAX(id) FROM patient_hospitals), 1), true) WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname = 'patient_hospitals_id_seq');
SELECT setval('appointments_id_seq', COALESCE((SELECT MAX(id) FROM appointments), 1), true) WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname = 'appointments_id_seq');
SELECT setval('medical_records_id_seq', COALESCE((SELECT MAX(id) FROM medical_records), 1), true) WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname = 'medical_records_id_seq');
SELECT setval('prescriptions_id_seq', COALESCE((SELECT MAX(id) FROM prescriptions), 1), true) WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname = 'prescriptions_id_seq');
SELECT setval('payments_id_seq', COALESCE((SELECT MAX(id) FROM payments), 1), true) WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_id_seq');
SELECT setval('record_access_requests_id_seq', COALESCE((SELECT MAX(id) FROM record_access_requests), 1), true) WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname = 'record_access_requests_id_seq');
SELECT setval('notifications_id_seq', COALESCE((SELECT MAX(id) FROM notifications), 1), true) WHERE EXISTS (SELECT 1 FROM pg_class WHERE relname = 'notifications_id_seq');
