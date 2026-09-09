package com.healix.hms.model;

import com.healix.hms.model.enums.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * =====================================================================
 * Abstract User class - DEMONSTRATES ABSTRACTION and INHERITANCE
 * =====================================================================
 * OOP Concepts:
 *   - Abstraction: abstract class with abstract method getRole()
 *   - Encapsulation: private fields with controlled getters/setters
 *   - Inheritance: Patient, Doctor, Admin extend this class
 *   - Constructors: default + parameterized constructors
 *   - this keyword: used in setters and constructors
 * =====================================================================
 *
 * JPA Inheritance Strategy: JOINED - each subclass gets its own table
 * linked via foreign key to the users table.
 */
@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email", name = "uk_user_email")
})
@Inheritance(strategy = InheritanceType.JOINED)
@EntityListeners(AuditingEntityListener.class)
@DiscriminatorColumn(name = "role", discriminatorType = DiscriminatorType.STRING)
public abstract class User {

    // Encapsulation: all fields are private
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    // Password stored as BCrypt hash - never plain text
    @NotBlank(message = "Password is required")
    @Column(nullable = false)
    private String password;

    @Column(length = 15)
    private String phone;

    @Column(length = 255)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, insertable = false, updatable = false)
    private Role role;

    @Column(nullable = false)
    private boolean active = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ---- Constructors ----
    // Default constructor required by JPA
    protected User() {}

    // Parameterized constructor - demonstrates constructor usage
    protected User(String name, String email, String password, String phone) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
    }

    // ---- Abstract method - demonstrates ABSTRACTION ----
    // Each subclass MUST provide its role string
    public abstract String getRoleDisplayName();

    // ---- Getters and Setters (Encapsulation) ----
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        // this keyword demonstrates disambiguation
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // ---- Method Overriding - demonstrates POLYMORPHISM ----
    @Override
    public String toString() {
        return "User{id=" + id + ", name='" + name + "', email='" + email + "', role=" + role + "}";
    }
}
