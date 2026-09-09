package com.healix.hms.exception;

public class DepartmentNotFoundException extends RuntimeException {
    public DepartmentNotFoundException(Long id) {
        super("Department not found with ID: " + id);
    }
    public DepartmentNotFoundException(String name) {
        super("Department not found with name: " + name);
    }
}
