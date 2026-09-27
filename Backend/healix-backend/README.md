# MediCare – Multi-Hospital AI-Enabled Hospital Management Platform

> A modern, enterprise-grade Java Full-Stack Multi-Hospital Healthcare Platform built for **KTU B.Tech CSE S3 Object-Oriented Programming (OOP) Project** (2024 Scheme).

---

## 🌟 Advanced Platform Features

### 🏥 Multi-Hospital Architecture (Thiruvananthapuram, Kerala)
- **Central Patient Identity**: A single patient identity (`PAT-TRV-XXXXXX`) registers and seamlessly interacts across multiple hospitals in Thiruvananthapuram (e.g. *MediCare City Hospital*, *Trivandrum Medical Trust*, *Sree Chitra Speciality Hospital*).
- **Logical Data Isolation**: Hospital-scoped administrators and doctors can only access data belonging to their assigned hospital.
- **Hospital-Specific Patient Numbers**: Each hospital maintains its own registration records and unique hospital patient number via `PatientHospital` junction mapping.

### 🤖 AI Symptom Assessment Chatbot (MediCare AI Assistant)
- **Clinical Triage**: Preliminary symptom assessment mapping user symptoms to severity levels (Low, Moderate, Critical).
- **Safety & Emergency Detection**: Immediate high-priority alerts for life-threatening symptoms (chest pain, shortness of breath, loss of consciousness).
- **Department Recommendation**: Recommends appropriate hospital departments (Cardiology, Neurology, Orthopedics, Dermatology, etc.) with a direct "Find Hospital & Book" workflow.
- **Adapter Design Pattern**: Clean interface separation (`AiHealthAssistant`) with an offline rule-based mock engine (`MockAiHealthAssistantAdapter`) requiring no paid cloud keys.

### 💳 Registration Fee Slip & Online Payment
- **Hospital Registration Fee**: Automatic calculation and checkout flow for hospital-specific registration fees and doctor consultation charges.
- **Modular Payment Gateway**: `PaymentGatewayAdapter` implemented with `MockPaymentGatewayAdapter` simulating UPI, Credit/Debit cards, and Net Banking without storing card/CVV data.
- **Printable / Downloadable Slip**: Generates official fee slips with transaction references, receipt stamps, and hospital information.

### 🔐 Cross-Hospital Record Sharing & Patient Consent
- **Strict Privacy Access Control**: Doctors at Hospital A cannot see patient records from Hospital B unless the patient explicitly approves a `RecordAccessRequest`.
- **Consent Center UI**: Patients can review, approve (e.g., 7 days validity), or reject record sharing requests from treating specialists.
- **Audit Logging**: All record accesses and critical administrative actions are logged with timestamps, IP addresses, and user identifiers.

### 📱 OTP Verification & Notification Hub
- **6-Digit Secure OTP**: Cryptographically secure OTP generation with 5-minute expiration, max attempt limits, and single-use invalidation (`OtpVerification`).
- **Notification Center**: Dual-channel notifications (SMS Adapter + In-App Notification Hub) for appointment bookings, payments, and record access requests.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 17/21 LTS, Spring Boot 3.2.5, Spring Security 6, Spring Data JPA |
| **Frontend** | Thymeleaf 3, Vanilla CSS3 (Purple Gradient Reference Theme), JavaScript, Bootstrap Icons |
| **Database** | Supabase / PostgreSQL (Hibernate ORM + Direct JDBC for reports) |
| **Design Patterns** | Singleton, Adapter (AI, Payment, SMS), DTO, Repository Pattern |
| **Architecture** | Layered Enterprise MVC Architecture adhering to SOLID principles |

---

## 🔐 Demo Credentials

| Role | Email | Password | Scope |
|---|---|---|---|
| **Super Admin** | `admin@healix.com` | `Admin@123` | Platform-wide |
| **Hospital Admin** | `admin.medicare@healix.com` | `Admin@123` | MediCare City Hospital |
| **Hospital Admin** | `admin.tvm@healix.com` | `Admin@123` | Trivandrum Medical Trust |
| **Doctor** | `doctor@healix.com` | `Doctor@123` | Hospital Cardiologist |
| **Patient** | `patient@healix.com` | `Patient@123` | Multi-Hospital Patient |

---

## 🚀 Setup & Execution Guide

### 1. Database Setup (Supabase)
1. In your Supabase project (Project Settings -> Database), copy your PostgreSQL connection details.
2. Configure credentials in `.env` (copy from `.env.example`) or directly in `application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://db.<your-project-ref>.supabase.co:5432/postgres?sslmode=require
   spring.datasource.username=postgres
   spring.datasource.password=your_password
   ```
3. PostgreSQL schema and demo accounts are initialized automatically on startup via `schema.sql` and `data.sql`.

### 2. Build & Run Application
From the `Backend/healix-backend` directory:
```bash
mvn clean spring-boot:run
```
Once started, navigate to:
**[http://localhost:8080](http://localhost:8080)**

---

## 📚 Academic OOP Reference
See [`OOP_CONCEPT_MAPPING.md`](OOP_CONCEPT_MAPPING.md) for detailed mapping of KTU S3 CSE OOP concepts (Encapsulation, Abstraction, Inheritance, Polymorphism, Method Overloading, Interfaces, Exception Handling, Singleton, Adapter Pattern, JDBC).
