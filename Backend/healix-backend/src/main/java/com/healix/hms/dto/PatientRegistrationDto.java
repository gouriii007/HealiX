package com.healix.hms.dto;

import com.healix.hms.model.enums.BloodGroup;
import com.healix.hms.model.enums.Gender;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

/**
 * PatientRegistrationDto - Data Transfer Object for patient registration/update.
 * Demonstrates DTO pattern - keeps entity layer separate from presentation layer.
 * SOLID SRP: only carries data, no business logic.
 */
public class PatientRegistrationDto {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email")
    private String email;

    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Please enter a valid 10-digit phone number")
    private String phone;

    private String address;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    private Gender gender;
    private BloodGroup bloodGroup;
    private String emergencyContact;
    private String emergencyContactName;

    // ---- Constructors ----
    public PatientRegistrationDto() {}

    public PatientRegistrationDto(String name, String email, String phone) {
        this.name = name;
        this.email = email;
        this.phone = phone;
    }

    // ---- Getters and Setters ----
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public Gender getGender() { return gender; }
    public void setGender(Gender gender) { this.gender = gender; }

    public BloodGroup getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(BloodGroup bloodGroup) { this.bloodGroup = bloodGroup; }

    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }

    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; }
}
