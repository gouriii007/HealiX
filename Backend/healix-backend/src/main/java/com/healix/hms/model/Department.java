package com.healix.hms.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.util.ArrayList;
import java.util.List;

/**
 * Department entity - represents hospital departments.
 * OOP Concepts: Encapsulation, OneToMany relationship
 */
@Entity
@Table(name = "departments")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Department name is required")
    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "icon_class", length = 50)
    private String iconClass;

    @Column(nullable = false)
    private boolean active = true;

    // OneToMany: one department has many doctors
    @OneToMany(mappedBy = "department", fetch = FetchType.LAZY)
    private List<Doctor> doctors = new ArrayList<>();

    // ---- Constructors ----
    public Department() {}

    public Department(String name, String description) {
        this.name = name;
        this.description = description;
    }

    // ---- Business method ----
    public int getDoctorCount() {
        return doctors != null ? doctors.size() : 0;
    }

    // ---- Getters and Setters ----
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIconClass() { return iconClass; }
    public void setIconClass(String iconClass) { this.iconClass = iconClass; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public List<Doctor> getDoctors() { return doctors; }
    public void setDoctors(List<Doctor> doctors) { this.doctors = doctors; }

    @Override
    public String toString() {
        return "Department{id=" + id + ", name='" + name + "'}";
    }
}
