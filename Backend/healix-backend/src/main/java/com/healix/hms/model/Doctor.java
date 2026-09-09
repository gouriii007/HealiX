package com.healix.hms.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * =====================================================================
 * Doctor entity - DEMONSTRATES INHERITANCE from User
 * =====================================================================
 * OOP Concepts:
 *   - Inheritance: extends User (IS-A relationship)
 *   - Method Overriding: getRoleDisplayName(), toString()
 *   - Encapsulation: private fields with controlled access
 *   - ManyToOne: Doctor belongs to a Department
 * =====================================================================
 */
@Entity
@Table(name = "doctors")
@DiscriminatorValue("ROLE_DOCTOR")
@PrimaryKeyJoinColumn(name = "user_id")
public class Doctor extends User {

    @NotBlank(message = "Specialization is required")
    @Column(nullable = false, length = 100)
    private String specialization;

    @NotBlank(message = "Qualification is required")
    @Column(nullable = false, length = 200)
    private String qualification;

    @Column(length = 500)
    private String bio;

    @Positive(message = "Experience must be a positive number")
    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "consultation_fee", precision = 10, scale = 2)
    private BigDecimal consultationFee;

    @Column(length = 200)
    private String availability;

    @Column(name = "profile_image", length = 255)
    private String profileImage;

    // ManyToOne relationship: many doctors belong to one department
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    // OneToMany: doctor can have many appointments
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Appointment> appointments = new ArrayList<>();

    // ---- Constructors ----
    public Doctor() {
        super();
    }

    public Doctor(String name, String email, String password, String phone,
                  String specialization, String qualification) {
        super(name, email, password, phone);
        this.specialization = specialization;
        this.qualification = qualification;
    }

    // ---- Abstract method implementation - POLYMORPHISM ----
    @Override
    public String getRoleDisplayName() {
        return "Doctor";
    }

    // ---- Business method ----
    public String getFullTitle() {
        return "Dr. " + getName();
    }

    // ---- Method Overriding - POLYMORPHISM ----
    @Override
    public String toString() {
        return "Doctor{id=" + getId() + ", name='Dr. " + getName() + "', specialization='" + specialization + "'}";
    }

    // ---- Getters and Setters ----
    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public Integer getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(Integer experienceYears) {
        this.experienceYears = experienceYears;
    }

    public BigDecimal getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(BigDecimal consultationFee) {
        this.consultationFee = consultationFee;
    }

    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public List<Appointment> getAppointments() {
        return appointments;
    }

    public void setAppointments(List<Appointment> appointments) {
        this.appointments = appointments;
    }
}
