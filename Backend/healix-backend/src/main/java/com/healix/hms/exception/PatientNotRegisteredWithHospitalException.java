package com.healix.hms.exception;

public class PatientNotRegisteredWithHospitalException extends RuntimeException {
    public PatientNotRegisteredWithHospitalException(String message) {
        super(message);
    }
}
