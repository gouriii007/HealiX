package com.healix.hms.exception;

public class HospitalNotFoundException extends RuntimeException {
    public HospitalNotFoundException(String message) {
        super(message);
    }
    public HospitalNotFoundException(Long id) {
        super("Hospital not found with ID: " + id);
    }
}
