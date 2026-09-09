package com.healix.hms.exception;

/**
 * AppointmentConflictException - thrown when time slot is already booked.
 * Demonstrates: checked exception concept (extends RuntimeException for simplicity).
 */
public class AppointmentConflictException extends RuntimeException {
    public AppointmentConflictException(String message) {
        super(message);
    }
}
