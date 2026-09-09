package com.healix.hms.exception;

public class DoctorNotFoundException extends RuntimeException {
    public DoctorNotFoundException(Long id) {
        super("Doctor not found with ID: " + id);
    }
    public DoctorNotFoundException(String email) {
        super("Doctor not found with email: " + email);
    }
}
