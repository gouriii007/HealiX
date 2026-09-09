package com.healix.hms.exception;

public class AppointmentNotFoundException extends RuntimeException {
    public AppointmentNotFoundException(Long id) {
        super("Appointment not found with ID: " + id);
    }
}
