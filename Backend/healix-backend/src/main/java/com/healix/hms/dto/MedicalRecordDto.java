package com.healix.hms.dto;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * MedicalRecordDto - Data Transfer Object for creating/updating medical records.
 */
public class MedicalRecordDto {

    @Size(max = 500)
    private String symptoms;

    @Size(max = 500)
    private String diagnosis;

    @Size(max = 1000)
    private String treatment;

    @Size(max = 1000)
    private String notes;

    private LocalDate followUpDate;

    // List of prescriptions to add
    private List<PrescriptionDto> prescriptions = new ArrayList<>();

    // ---- Inner class for prescription data ----
    // Demonstrates INNER CLASS concept
    public static class PrescriptionDto {
        private String medicineName;
        private String dosage;
        private String frequency;
        private String duration;
        private String instructions;

        public PrescriptionDto() {}

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

    // ---- Constructors ----
    public MedicalRecordDto() {}

    // ---- Getters and Setters ----
    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }

    public String getTreatment() { return treatment; }
    public void setTreatment(String treatment) { this.treatment = treatment; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDate getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(LocalDate followUpDate) { this.followUpDate = followUpDate; }

    public List<PrescriptionDto> getPrescriptions() { return prescriptions; }
    public void setPrescriptions(List<PrescriptionDto> prescriptions) { this.prescriptions = prescriptions; }
}
