package com.healix.hms.exception;

public class HospitalAccessDeniedException extends RuntimeException {
    public HospitalAccessDeniedException(String message) {
        super(message);
    }
}
