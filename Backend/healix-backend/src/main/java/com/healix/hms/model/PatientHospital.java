package com.healix.hms.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * =====================================================================
 * PatientHospital - Junction entity linking central Patient to Hospital
 * =====================================================================
 * Allows a single patient identity (PAT-TRV-XXXXXX) to maintain distinct
 * registration records, patient IDs, and statuses across multiple hospitals.
 * =====================================================================
 */
@Entity
@Table(name = "patient_hospitals", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"patient_id", "hospital_id"}, name = "uk_patient_hospital")
})
@EntityListeners(AuditingEntityListener.class)
public class PatientHospital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @Column(name = "hospital_patient_number", nullable = false, length = 50)
    private String hospitalPatientNumber;

    @CreatedDate
    @Column(name = "registered_at", nullable = false, updatable = false)
    private LocalDateTime registeredAt = LocalDateTime.now();

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE";

    @Column(name = "registration_slip_id", length = 100)
    private String registrationSlipId;

    public PatientHospital() {}

    public PatientHospital(Patient patient, Hospital hospital, String hospitalPatientNumber) {
        this.patient = patient;
        this.hospital = hospital;
        this.hospitalPatientNumber = hospitalPatientNumber;
        this.registeredAt = LocalDateTime.now();
        this.status = "ACTIVE";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public Hospital getHospital() { return hospital; }
    public void setHospital(Hospital hospital) { this.hospital = hospital; }

    public String getHospitalPatientNumber() { return hospitalPatientNumber; }
    public void setHospitalPatientNumber(String hospitalPatientNumber) { this.hospitalPatientNumber = hospitalPatientNumber; }

    public LocalDateTime getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(LocalDateTime registeredAt) { this.registeredAt = registeredAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRegistrationSlipId() { return registrationSlipId; }
    public void setRegistrationSlipId(String registrationSlipId) { this.registrationSlipId = registrationSlipId; }
}
