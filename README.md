# Healix – Full-Stack Hospital Management System (HMS)

> A modern, production-grade Java Full-Stack Hospital Management System built for **KTU B.Tech CSE S3 Object-Oriented Programming (OOP) Project** (2024 Scheme).

---

## 🌟 Key Features

### 👤 Patient Portal
- **Self-service Registration & Login**: Account setup with medical demographics and emergency contacts.
- **Find Doctors**: Search by name or filter by department with consultation fees and availability.
- **Appointment Booking**: Real-time slot picker (Morning, Afternoon, Evening) with conflict detection.
- **Appointment Management**: View scheduled appointments and cancel with instant notification.
- **Electronic Health Records (EHR)**: View diagnoses, doctor clinical notes, and print medical records.
- **Digital Prescriptions**: Medication dosages, frequency, duration, and instructions list.
- **Profile & Emergency Contacts**: Manage personal details and blood group.

### 🩺 Doctor Portal
- **Dashboard**: Real-time metrics of today's schedule, pending, confirmed, and completed visits.
- **Appointment Queue**: Filter by status and confirm or complete appointments.
- **EHR & Prescription Creator**: Dynamic prescription item entry with dosages and clinical notes.
- **Patient Roster & Medical History**: Review prior diagnoses and past appointments for assigned patients.
- **Doctor Schedule**: Daily and weekly consultation schedule view.
- **Doctor Profile**: Display specialization, qualification, bio, and clinic timings.

### 🛡️ Admin Portal
- **Executive Analytics**: Statistics on patients, active doctors, appointments, and hospital revenue.
- **Doctor Management (CRUD)**: Onboard, edit, and deactivate medical specialists.
- **Patient Management (CRUD)**: Manage registered patients, review records, and activate/deactivate.
- **Department Management**: Create and organize clinical departments (Cardiology, Neurology, Pediatrics, etc.).
- **Master Appointment Schedule**: System-wide appointment filtering and status management.
- **Reports & Analytics (JDBC-Powered)**: Direct SQL aggregates for daily logs, department distribution, and revenue summary.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 17/21, Spring Boot 3.2.5, Spring Security 6, Spring Data JPA |
| **Frontend** | Thymeleaf 3, Vanilla CSS3 (Custom Design System), JavaScript (ES6+), Bootstrap Icons |
| **Database** | Supabase / PostgreSQL (Hibernate ORM + Direct JDBC for reports) |
| **Design Patterns** | Singleton, Adapter, Data Transfer Object (DTO), Repository Pattern |
| **Architecture** | Layered Enterprise MVC Architecture adhering to SOLID principles |

---

## 🔐 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `admin@healix.com` | `Admin@123` |
| **Hospital Admin** | `admin.medicare@healix.com` | `Admin@123` |
| **Doctor** | `doctor@healix.com` | `Doctor@123` |
| **Patient** | `patient@healix.com` | `Patient@123` |

---

## 🚀 Setup & Execution Guide

### 1. Database Setup (Supabase)
1. Create a free project at **[https://supabase.com](https://supabase.com)**.
2. In your Supabase Project Dashboard, go to **Project Settings** -> **Database**.
3. Under **Connection string**, select **JDBC** or copy your PostgreSQL credentials:
   - Host: `db.<your-project-ref>.supabase.co` (or pooler: `aws-0-<region>.pooler.supabase.com`)
   - Port: `5432` (direct) or `6543` (pooler)
   - Database: `postgres`
   - User: `postgres` (or `postgres.<your-project-ref>`)
   - Password: `<your-db-password>`
4. Set your credentials in `Backend/healix-backend/src/main/resources/application.properties` or create an `.env` file from `.env.example`:
   ```properties
   spring.datasource.url=jdbc:postgresql://db.<your-project-ref>.supabase.co:5432/postgres?sslmode=require
   spring.datasource.username=postgres
   spring.datasource.password=your_db_password
   ```
5. Tables and sample data (`schema.sql` and `data.sql`) are loaded automatically on startup!

### 2. Build & Run Application
From the `Backend/healix-backend` directory:
```bash
mvn clean spring-boot:run
```
Once started, navigate to:
**[http://localhost:8080](http://localhost:8080)**

---

## 📚 Academic OOP Reference
See [`OOP_CONCEPT_MAPPING.md`](OOP_CONCEPT_MAPPING.md) for detailed mapping of KTU S3 CSE OOP concepts (Encapsulation, Abstraction, Inheritance, Polymorphism, Method Overloading, Interfaces, Exception Handling, Singleton, Adapter, JDBC).
