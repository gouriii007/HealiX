package com.healix.hms.model;

import jakarta.persistence.*;

/**
 * =====================================================================
 * Admin entity - DEMONSTRATES INHERITANCE from User
 * =====================================================================
 * OOP Concepts:
 *   - Inheritance: extends User (IS-A relationship)
 *   - Method Overriding: getRoleDisplayName(), toString()
 * =====================================================================
 */
@Entity
@Table(name = "admins")
@DiscriminatorValue("ROLE_ADMIN")
@PrimaryKeyJoinColumn(name = "user_id")
public class Admin extends User {

    @Column(name = "employee_id", unique = true, length = 50)
    private String employeeId;

    @Column(name = "designation", length = 100)
    private String designation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id")
    private Hospital hospital; // null for SUPER_ADMIN, populated for HOSPITAL_ADMIN

    // ---- Constructors ----
    public Admin() {
        super();
    }

    public Admin(String name, String email, String password, String phone) {
        super(name, email, password, phone);
    }

    // ---- Abstract method implementation - POLYMORPHISM ----
    @Override
    public String getRoleDisplayName() {
        return "Administrator";
    }

    // ---- Method Overriding - POLYMORPHISM ----
    @Override
    public String toString() {
        return "Admin{id=" + getId() + ", name='" + getName() + "', designation='" + designation + "'}";
    }

    // ---- Getters and Setters ----
    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public Hospital getHospital() {
        return hospital;
    }

    public void setHospital(Hospital hospital) {
        this.hospital = hospital;
    }
}
