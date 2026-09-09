package com.healix.hms.exception;

/**
 * PatientNotFoundException - custom unchecked exception.
 * Demonstrates custom exception handling, throw/throws keywords.
 */
public class PatientNotFoundException extends RuntimeException {

    private final Long patientId;

    public PatientNotFoundException(Long patientId) {
        super("Patient not found with ID: " + patientId);
        this.patientId = patientId;
    }

    public PatientNotFoundException(String email) {
        super("Patient not found with email: " + email);
        this.patientId = null;
    }

    public PatientNotFoundException(String message, Throwable cause) {
        super(message, cause);
        this.patientId = null;
    }

    public Long getPatientId() {
        return patientId;
    }
}
