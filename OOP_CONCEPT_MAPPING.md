# Healix Hospital Management System
## KTU B.Tech CSE S3 OOP (Object-Oriented Programming) Concept Mapping

This document provides a comprehensive mapping of all Object-Oriented Programming (OOP) concepts implemented in the **Healix Hospital Management System** as per the KTU B.Tech Computer Science and Engineering S3 (2024 Scheme) Object-Oriented Programming curriculum.

---

### 1. Encapsulation
- **Definition**: Wrapping of data (attributes) and methods that operate on the data into a single unit (class) while restricting direct access to components via private access modifiers.
- **Implementation**:
  - `User.java`: Private fields `id`, `name`, `email`, `password`, `phone`, `role`, `active`, `createdAt` with public getters and setters.
  - `Patient.java`, `Doctor.java`, `Appointment.java`, `MedicalRecord.java`, `Department.java`, `Prescription.java`, `Notification.java`: All entity fields are private to protect integrity.
  - Form validations (`@NotNull`, `@Size`, `@Email`, `@Past`) protect bean states.

---

### 2. Abstraction
- **Definition**: Hiding implementation details and showing only essential features to the user.
- **Implementation**:
  - **Abstract Class**: `com.healix.hms.model.User` is declared `abstract`. It cannot be directly instantiated. It declares the abstract method:
    ```java
    public abstract String getDashboardUrl();
    ```
  - **Interfaces**: Service interfaces (`PatientService`, `DoctorService`, `AppointmentService`, `MedicalRecordService`, `DepartmentService`, `NotificationService`, `ReportService`) define business contracts completely decoupled from implementation details.

---

### 3. Inheritance
- **Definition**: The mechanism in Java by which one class acquires properties and behaviors of a parent class (`extends` keyword).
- **Implementation**:
  - Single-table / joined inheritance with JPA:
    - `Patient extends User`
    - `Doctor extends User`
    - `Admin extends User`
  - Subclasses inherit all common identity fields, authentication credentials, auditing timestamps, and methods from `User`.

---

### 4. Polymorphism
- **Definition**: The ability of an entity to take more than one form.
  - **Runtime Polymorphism (Method Overriding)**:
    - `Patient`, `Doctor`, and `Admin` override `public abstract String getDashboardUrl()`:
      - `Patient.getDashboardUrl()` returns `"/patient/dashboard"`
      - `Doctor.getDashboardUrl()` returns `"/doctor/dashboard"`
      - `Admin.getDashboardUrl()` returns `"/admin/dashboard"`
    - Invoked dynamically in `CustomAuthSuccessHandler.java`:
      ```java
      User user = userRepository.findByEmail(username).orElse(null);
      String redirectUrl = user != null ? user.getDashboardUrl() : "/";
      ```
  - **Compile-time Polymorphism (Method Overloading)**:
    - `PatientService` & `PatientServiceImpl`:
      ```java
      Patient findPatient(Long id);
      Patient findPatient(String email);
      ```
    - Overloaded methods share the same name with different parameter signatures.

---

### 5. Interfaces
- **Definition**: Pure abstract types specifying what a class must do without specifying how.
- **Implementation**:
  - `com.healix.hms.service.AppointmentService`
  - `com.healix.hms.service.DoctorService`
  - `com.healix.hms.service.PatientService`
  - `com.healix.hms.service.MedicalRecordService`
  - `com.healix.hms.service.DepartmentService`
  - `com.healix.hms.service.NotificationService`
  - `com.healix.hms.service.ReportService`
  - `com.healix.hms.pattern.adapter.NotificationAdapter`

---

### 6. Constructors & `this` Keyword
- **Definition**: Special methods invoked during object creation to initialize object state; `this` differentiates instance variables from local parameters.
- **Implementation**:
  - Parameterized and default no-arg constructors in `PatientRegistrationDto`, `DoctorRegistrationDto`, `MedicalRecordDto`, and entity classes.
  - Constructor-based Dependency Injection across all Spring Controllers and Service implementations (`this.patientService = patientService;`).

---

### 7. `static` and `final` Keywords
- **Definition**:
  - `static`: Class-level variables and methods that belong to the class rather than instances.
  - `final`: Non-modifiable constants, unextendable classes, or non-overridable methods.
- **Implementation**:
  - `com.healix.hms.util.AppConstants`: Defines `static final` application constants (time slots, default fees, system configuration).
  - Controller dependencies are declared `private final` to enforce immutability after constructor injection.

---

### 8. Inner Classes (Nested Classes)
- **Definition**: Defining a class within another enclosing class to logically group helper structures.
- **Implementation**:
  - `com.healix.hms.dto.MedicalRecordDto.PrescriptionDto`: Nested static inner class representing individual prescription items attached to a medical record.

---

### 9. Custom Exception Handling & Robustness
- **Definition**: Controlled handling of runtime errors using `try-catch` and hierarchy of `Exception` subclasses.
- **Implementation**:
  - Hierarchy of domain exceptions extending `RuntimeException`:
    - `AppointmentConflictException` (prevents double-booking doctor slots)
    - `AppointmentNotFoundException`
    - `DoctorNotFoundException`
    - `PatientNotFoundException`
    - `DepartmentNotFoundException`
    - `InvalidLoginException`
  - Centralized global exception handler (`GlobalExceptionHandler.java`) annotated with `@ControllerAdvice` to prevent unhandled stack traces and render user-friendly error views.

---

### 10. Design Patterns
1. **Singleton Pattern**:
   - `HospitalConfiguration.java`: Thread-safe double-checked locking implementation maintaining centralized hospital system policies.
2. **Adapter Pattern**:
   - `NotificationAdapter.java`: Interface adapted by `EmailNotificationAdapter.java` and `SMSNotificationAdapter.java` to decouple communication channels.
3. **Data Transfer Object (DTO) Pattern**:
   - Decouples HTTP request binding from relational database entities (`AppointmentBookingDto`, `PatientRegistrationDto`, `DoctorRegistrationDto`, `MedicalRecordDto`).

---

### 11. Relational Database & Direct JDBC Integration
- **Implementation**:
  - Full relational Supabase PostgreSQL schema with primary keys, foreign keys (`ON DELETE CASCADE`), indexes, and unique constraints (`schema.sql`).
  - **Raw JDBC Component**: `JdbcReportUtil.java` demonstrates direct `java.sql.Connection`, `PreparedStatement`, and `ResultSet` execution for high-performance administrative reports and aggregates alongside Hibernate/JPA.

---

### 12. SOLID Principles Summary
- **Single Responsibility Principle (SRP)**: Controllers handle HTTP, services handle domain logic, repositories handle persistence.
- **Open/Closed Principle (OCP)**: Notification delivery extensible via new `NotificationAdapter` implementations without modifying existing business services.
- **Liskov Substitution Principle (LSP)**: `Patient`, `Doctor`, and `Admin` can be substituted wherever `User` is required.
- **Interface Segregation Principle (ISP)**: Focused service interfaces per domain entity rather than one monolithic service.
- **Dependency Inversion Principle (DIP)**: Controllers and services depend on abstractions (interfaces), wired via Spring Dependency Injection.
