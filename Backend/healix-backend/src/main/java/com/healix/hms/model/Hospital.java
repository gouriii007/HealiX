package com.healix.hms.model;

import com.healix.hms.model.enums.HospitalStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * =====================================================================
 * Hospital Entity - Core multi-tenant healthcare institution model
 * =====================================================================
 * OOP Concepts:
 *   - Encapsulation: Private state with validated accessors
 *   - Associations: 1-to-many with Doctors, Departments, Appointments
 * =====================================================================
 */
@Entity
@Table(name = "hospitals", uniqueConstraints = {
        @UniqueConstraint(columnNames = "hospital_code", name = "uk_hospital_code")
})
@EntityListeners(AuditingEntityListener.class)
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Hospital code is required")
    @Size(max = 50)
    @Column(name = "hospital_code", nullable = false, unique = true, length = 50)
    private String hospitalCode;

    @NotBlank(message = "Hospital name is required")
    @Size(max = 150)
    @Column(name = "hospital_name", nullable = false, length = 150)
    private String hospitalName;

    @Column(length = 255)
    private String address;

    @Column(length = 100)
    private String city = "Thiruvananthapuram";

    @Column(length = 100)
    private String district = "Thiruvananthapuram";

    @Column(length = 100)
    private String state = "Kerala";

    @Column(length = 10)
    private String pincode = "695001";

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(length = 150)
    private String website;

    @Column(length = 1000)
    private String description;

    @Column(length = 255)
    private String logo;

    @Column(name = "registration_number", length = 100)
    private String registrationNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private HospitalStatus status = HospitalStatus.ACTIVE;

    @Column(name = "registration_fee", precision = 10, scale = 2)
    private BigDecimal registrationFee = new BigDecimal("250.00");

    @OneToMany(mappedBy = "hospital", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Department> departments = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Hospital() {}

    public Hospital(String hospitalCode, String hospitalName, String city, String phone, String email) {
        this.hospitalCode = hospitalCode;
        this.hospitalName = hospitalName;
        this.city = city;
        this.phone = phone;
        this.email = email;
        this.status = HospitalStatus.ACTIVE;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getHospitalCode() { return hospitalCode; }
    public void setHospitalCode(String hospitalCode) { this.hospitalCode = hospitalCode; }

    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public HospitalStatus getStatus() { return status; }
    public void setStatus(HospitalStatus status) { this.status = status; }

    public BigDecimal getRegistrationFee() { return registrationFee; }
    public void setRegistrationFee(BigDecimal registrationFee) { this.registrationFee = registrationFee; }

    public List<Department> getDepartments() { return departments; }
    public void setDepartments(List<Department> departments) { this.departments = departments; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
