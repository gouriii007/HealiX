package com.healix.hms.model;

import com.healix.hms.model.enums.BloodGroup;
import com.healix.hms.model.enums.Gender;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;

/**
 * =====================================================================
 * Patient entity - DEMONSTRATES INHERITANCE from User
 * =====================================================================
 * OOP Concepts:
 *   - Inheritance: extends User (IS-A relationship)
 *   - Method Overriding: getRoleDisplayName(), toString()
 *   - Encapsulation: private fields, controlled access
 *   - Constructors: default + parameterized constructors
 *   - Polymorphism: overriding abstract method from User
 * =====================================================================
 */
@Entity
@Table(name = "patients")
@DiscriminatorValue("ROLE_PATIENT")
@PrimaryKeyJoinColumn(name = "user_id")
public class Patient extends User {

    @Past(message = "Date of birth must be in the past")
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Gender gender;

    @Enumerated(EnumType.STRING)
    @Column(name = "blood_group", length = 10)
    private BloodGroup bloodGroup;

    @Column(name = "emergency_contact", length = 15)
    private String emergencyContact;

    @Column(name = "emergency_contact_name", length = 100)
    private String emergencyContactName;

    // Relationship: Patient can have many appointments
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Appointment> appointments = new ArrayList<>();

    // Relationship: Patient can have many medical records
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MedicalRecord> medicalRecords = new ArrayList<>();

    // ---- Constructors ----
    public Patient() {
        super();
    }

    public Patient(String name, String email, String password, String phone) {
        // Using parent constructor - demonstrates super() usage
        super(name, email, password, phone);
    }

    // ---- Abstract method implementation - demonstrates POLYMORPHISM ----
    @Override
    public String getRoleDisplayName() {
        return "Patient";
    }

    // ---- Business method: calculate age from date of birth ----
    public int getAge() {
        if (this.dateOfBirth == null) return 0;
        return Period.between(this.dateOfBirth, LocalDate.now()).getYears();
    }

    // ---- Method Overriding - POLYMORPHISM ----
    @Override
    public String toString() {
        return "Patient{id=" + getId() + ", name='" + getName() + "', dob=" + dateOfBirth + "}";
    }

    // ---- Getters and Setters ----
    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public BloodGroup getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(BloodGroup bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public String getEmergencyContact() {
        return emergencyContact;
    }

    public void setEmergencyContact(String emergencyContact) {
        this.emergencyContact = emergencyContact;
    }

    public String getEmergencyContactName() {
        return emergencyContactName;
    }

    public void setEmergencyContactName(String emergencyContactName) {
        this.emergencyContactName = emergencyContactName;
    }

    public List<Appointment> getAppointments() {
        return appointments;
    }

    public void setAppointments(List<Appointment> appointments) {
        this.appointments = appointments;
    }

    public List<MedicalRecord> getMedicalRecords() {
        return medicalRecords;
    }

    public void setMedicalRecords(List<MedicalRecord> medicalRecords) {
        this.medicalRecords = medicalRecords;
    }
}
