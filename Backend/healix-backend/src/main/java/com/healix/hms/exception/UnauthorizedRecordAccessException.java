package com.healix.hms.exception;

public class UnauthorizedRecordAccessException extends RuntimeException {
    public UnauthorizedRecordAccessException(String message) {
        super(message);
    }
}
