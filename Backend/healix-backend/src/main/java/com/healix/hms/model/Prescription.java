package com.healix.hms.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

/**
 * Prescription entity - medicine prescriptions within a medical record.
 * OOP Concepts: ManyToOne with MedicalRecord, Encapsulation
 */
@Entity
@Table(name = "prescriptions")
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ManyToOne: many prescriptions belong to one medical record
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medical_record_id", nullable = false)
    private MedicalRecord medicalRecord;

    @NotBlank(message = "Medicine name is required")
    @Column(name = "medicine_name", nullable = false, length = 200)
    private String medicineName;

    @Column(length = 100)
    private String dosage;

    @Column(length = 100)
    private String frequency;

    @Column(length = 100)
    private String duration;

    @Column(length = 500)
    private String instructions;

    // ---- Constructors ----
    public Prescription() {}

    public Prescription(MedicalRecord medicalRecord, String medicineName,
                        String dosage, String frequency, String duration) {
        this.medicalRecord = medicalRecord;
        this.medicineName = medicineName;
        this.dosage = dosage;
        this.frequency = frequency;
        this.duration = duration;
    }

    // ---- Getters and Setters ----
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public MedicalRecord getMedicalRecord() { return medicalRecord; }
    public void setMedicalRecord(MedicalRecord medicalRecord) { this.medicalRecord = medicalRecord; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
}
