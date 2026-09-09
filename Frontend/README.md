# Healix HMS – Frontend Architecture & Design System

## Overview
The Healix Hospital Management System frontend is built with a server-rendered, responsive design leveraging **Spring Boot 3 + Thymeleaf**, modern **Vanilla CSS**, and lightweight interactive JavaScript.

## Color System & Brand Identity
- **Branding Navy**: `#0F2042` / `#1E3A8A`
- **Clinical Accent**: `#3B82F6` / `#06B6D4`
- **Patient Portal Reassurance (Teal)**: `#0D9488` / `#10B981`
- **Doctor Portal Focus (Indigo)**: `#6366F1`
- **Admin Alert & Analytics**: `#EF4444` (Critical), `#F59E0B` (Pending), `#10B981` (Success)
- **Backgrounds & Surfaces**: `#F8F9FA` (Page base), `#FFFFFF` (Card surfaces), `#E5E7EB` (Borders)
- **Typography**: Inter (Google Fonts 300, 400, 500, 600, 700, 800)

## Portals & Template Structure
```
Frontend/
├── templates/
│   ├── index.html                     # Public landing page (Hero, Services, Specialists)
│   ├── login.html                     # Split-screen role authentication
│   ├── register.html                  # Self-service patient registration
│   ├── error.html                     # General exception & error handling
│   ├── fragments/
│   │   └── layout.html                # Reusable navigation & sidebar fragments
│   ├── admin/
│   │   ├── dashboard.html             # High-level metrics & recent appointments
│   │   ├── patients.html              # Patient management table & search
│   │   ├── patient-form.html          # Add/Edit patient modal & form
│   │   ├── patient-view.html          # Comprehensive patient profile
│   │   ├── doctors.html               # Doctor registry
│   │   ├── doctor-form.html           # Doctor onboarding form
│   │   ├── departments.html           # Department CRUD operations
│   │   ├── appointments.html          # System-wide appointment master schedule
│   │   └── reports.html               # JDBC-powered analytics & financial overview
│   ├── doctor/
│   │   ├── dashboard.html             # Daily queue, metrics, quick actions
│   │   ├── appointments.html          # Doctor appointment manager with status updates
│   │   ├── patients.html              # Assigned patient roster
│   │   ├── patient-view.html          # Patient consultation history & EHR
│   │   ├── medical-records.html       # Eligible appointments for diagnosis
│   │   ├── medical-record-form.html   # Dynamic prescription & clinical notes entry
│   │   ├── medical-record-view.html   # Printable EHR consultation record
│   │   ├── schedule.html              # Weekly consultation slots
│   │   ├── profile.html               # Doctor credentials & availability
│   │   └── notifications.html         # Real-time booking & hospital alerts
│   ├── patient/
│   │   ├── dashboard.html             # Health overview, upcoming visits, stats
│   │   ├── book-appointment.html      # Slot selection & specialist booking
│   │   ├── appointments.html          # Appointment history & cancellation
│   │   ├── doctors.html               # Doctor directory with department filtering
│   │   ├── medical-records.html       # Full medical history
│   │   ├── medical-record-view.html   # Certified medical record view
│   │   ├── prescriptions.html         # Digital medication list & dosage instructions
│   │   ├── profile.html               # Patient profile & emergency contacts
│   │   └── notifications.html         # Booking alerts & confirmation notices
│   └── error/
│       └── access-denied.html         # 403 Access Denied fallback
└── static/
    ├── css/
    │   └── main.css                   # Custom responsive CSS design system
    └── js/
        └── main.js                    # Sidebar toggles, auto-dismiss alerts, modals
```
